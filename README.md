# Backend API - Sistema de Gestión de Módulos

## 📋 Descripción

Sistema backend robusto desarrollado con Node.js, Express y TypeScript que proporciona gestión de módulos, autenticación JWT, comunicación en tiempo real y servicios de keep-alive para mantener la conectividad con MongoDB.

## 🏗️ Arquitectura

### Estructura del Proyecto
```
src/
├── config/           # Configuración de base de datos
├── controllers/      # Controladores de rutas (auth, modules, contact, user)
├── domain/          # Lógica de dominio y casos de uso
├── helpers/         # Funciones auxiliares
├── middleware/      # Middlewares (auth, rate limit, timing)
├── models/          # Modelos de MongoDB (User, ModuleStatus)
├── presentation/    # Capa de presentación y servicios cron
├── routes/          # Definición de rutas (auth, modules, contact, user)
├── schemas/         # Esquemas de validación (Zod)
├── scripts/         # Scripts de migración y utilidades
├── services/        # Servicios (keep-alive, email)
├── sockets/         # Configuración de WebSockets
└── utils/           # Utilidades (cache, logger, hash)
```

## 🚀 Características Principales

### ✅ **Funcionalidades Implementadas**

- **🔐 Autenticación JWT Completa**
  - Login/Logout con tokens de acceso y refresh
  - Middleware de autenticación robusto
  - Gestión segura de sesiones

- **👤 Gestión de Perfil de Usuario**
  - Obtener perfil autenticado
  - Actualizar datos personales (nombre, avatar, teléfono)
  - Cambiar contraseña de forma segura con validación

- **📊 Gestión de Módulos**
  - CRUD completo de módulos
  - Control de estado (activo/inactivo/bloqueado)
  - Sistema de auditoría (quién y cuándo modificó)
  - Modelo [`ModuleStatus`](src/models/moduleStatus.model.ts) para persistencia

- **⚡ Comunicación en Tiempo Real**
  - WebSockets configurados con Socket.io
  - Evento `update-module` para sincronización frontend-backend
  - Estado inicial de módulos (`init-module-status`)
  - Notificaciones instantáneas de cambios

- **🛡️ Seguridad y Middleware**
  - Rate limiting implementado
  - Middleware de timing para monitoreo
  - Protección de rutas sensibles

- **🔄 Keep-Alive Inteligente**
  - Cron jobs para mantener MongoDB activo
  - Prevención de cold starts en planes gratuitos
  - Monitoreo de salud de la base de datos

### 🆕 **Nuevas Implementaciones**

#### **Sistema de Keep-Alive para MongoDB**
```typescript
// Servicio automático cada 4 horas
const keepAliveService = KeepAliveService.getInstance();
keepAliveService.startMongoDBKeepAlive();
```

- **Cron Job Principal**: Cada 4 horas (`0 */4 * * *`)
- **Health Check**: Cada 30 minutos (`*/30 * * * *`)
- **Logging detallado**: Winston para monitoreo
- **Graceful shutdown**: Cierre limpio de servicios

#### **Servicios de Monitoreo**
- [`MongoDBKeepAliveService`](src/services/mongodb-keepalive.service.ts): Ping a base de datos
- [`KeepAliveService`](src/services/keep-alive.service.ts): Gestión centralizada de cron jobs
- Endpoint `/health`: Estado del sistema en tiempo real

## 🛠️ Tecnologías

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de Datos**: MongoDB Atlas con Mongoose
- **Autenticación**: JWT (jsonwebtoken)
- **Email**: Resend
- **WebSockets**: Socket.io
- **Cron Jobs**: node-cron
- **Logging**: Winston
- **Validación**: Zod

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm run build
npm start
```

## 🔧 Configuración

### Variables de Entorno
```env
NODE_ENV=development
PORT=4000
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
API_BASE_URL=http://localhost:4000
LOG_LEVEL=info
RESEND_API_KEY=your-resend-api-key
```

### Base de Datos
El sistema se conecta automáticamente a MongoDB Atlas al iniciar. La configuración se encuentra en [`config/db.ts`](src/config/db.ts).

### Migraciones
Cuando agregues nuevos campos a los modelos, ejecuta:
```bash
npm run migrate:module-status
```

## 🔌 WebSockets Events

### Eventos del Servidor
- `init-module-status` - Estado inicial de todos los módulos al conectar
- `update-module` - Cambio de estado de módulo en tiempo real

#### Estructura del evento `update-module`:
```json
{
  "moduleName": "nasaGallery",
  "isActive": true,
  "isBlocked": false,
  "lastModifiedAt": "2025-01-16T15:30:45.123Z",
  "lastModifiedBy": {
    "_id": "683c83af62b3565e9ae648ac",
    "name": "Andres Otalvaro",
    "email": "andr3s.o7alvaro@gmail.com"
  }
}
```

## 🔌 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Renovar token

### Módulos
- `GET /modules` - Listar módulos con información de auditoría
- `POST /modules/toggle` - Cambiar estado de módulo (requiere autenticación)

#### Respuesta de GET /modules:
```json
{
  "status": "success",
  "data": [
    {
      "moduleName": "nasaGallery",
      "isActive": true,
      "name": "Img desde marte",
      "isBlocked": false,
      "lastModifiedAt": "2025-01-16T15:30:45.123Z",
      "lastModifiedBy": {
        "_id": "683c83af62b3565e9ae648ac",
        "name": "Andres Otalvaro",
        "email": "andr3s.o7alvaro@gmail.com"
      }
    }
  ]
}
```

### Contacto
- `POST /contact` - Enviar mensaje de contacto

### Perfil de Usuario
- `GET /user/profile` - Obtener perfil del usuario autenticado (requiere token)
- `PATCH /user/profile` - Actualizar nombre, avatar y teléfono (requiere token)
- `PATCH /user/password` - Cambiar contraseña (requiere token)

### Sistema
- `GET /health` - Estado detallado del sistema y jobs activos
- `GET /ping` - Keep-alive ligero para servicios externos (UptimeRobot)

## 🔄 Keep-Alive System

### ¿Por qué Keep-Alive?
MongoDB Atlas (plan gratuito) entra en "hibernación" después de períodos de inactividad, causando cold starts que pueden tomar 10-30 segundos. **Render también duerme servicios gratuitos** después de 15 minutos de inactividad.

### 🚀 **Estrategia de Doble Keep-Alive**

#### **1. Keep-Alive Interno (Cron Jobs)**
- **Función**: Mantiene MongoDB activo cuando el servidor está despierto
- **Programación**: Cada 2 horas (`0 */2 * * *`)
- **Limitación**: No funciona si Render está dormido

#### **2. Keep-Alive Externo (UptimeRobot)**
- **Función**: Despierta Render + mantiene MongoDB activo
- **Endpoint**: `GET /ping` (optimizado para servicios externos)
- **Frecuencia**: Cada 10 minutos
- **Ventaja**: Funciona 24/7, nunca duerme

### 🔧 **Configuración Recomendada**

#### **UptimeRobot Setup:**
```
URL: https://tu-app.onrender.com/ping
Método: GET
Intervalo: 10 minutos
Tipo: HTTP(s)
```

#### **Cron Jobs Internos:**
```typescript
// Keep-alive principal - cada 4 horas
'0 */4 * * *'

// Health check - cada 30 minutos  
'*/30 * * * *'
```

### ⚡ **Flujo de Funcionamiento**
```
UptimeRobot (cada 10min)
    ↓
GET /ping
    ↓  
Render se despierta
    ↓
Ping a MongoDB
    ↓
MongoDB permanece activo
    ↓
Respuesta: { status: 'pong' }
```

## 📊 Logging y Monitoreo

### Winston Logger
- **Levels**: error, warn, info, debug
- **Outputs**: Console (dev) + archivos (prod)
- **Formato**: JSON estructurado con timestamps

### Health Monitoring

#### **Endpoint Completo:**
```bash
curl http://localhost:4000/health
```
Respuesta incluye:
- Estado general del sistema
- Uptime y uso de memoria
- Estado de todos los cron jobs
- Información detallada para debugging

#### **Endpoint Ligero (Keep-Alive):**
```bash
curl http://localhost:4000/ping
```
Respuesta optimizada:
```json
{
  "status": "pong",
  "database": "connected",
  "timestamp": "2025-12-16T10:30:00Z",
  "source": "external-ping"
}
```

## 🧪 Testing (Recomendado)

```bash
# Ejecutar migración de base de datos
npm run migrate:module-status

# Ejecutar tests unitarios (pendiente implementar)
npm test
```

## 🚀 Deployment

### 🌐 **Render.com (Recomendado)**

#### **1. Deploy en Render:**
```bash
# Build del proyecto
npm run build

# Iniciar en producción
npm start
```

#### **2. Variables de Entorno en Render:**
```env
NODE_ENV=production
PORT=10000
API_BASE_URL=https://tu-app.onrender.com
JWT_SECRET=tu-secret-super-seguro
DB_URI=mongodb+srv://...
LOG_LEVEL=info
```

#### **3. Configurar UptimeRobot (CRÍTICO):**
1. Registrarse en [UptimeRobot](https://uptimerobot.com/) (gratis)
2. Crear nuevo monitor:
   - **URL**: `https://tu-app.onrender.com/ping`
   - **Tipo**: HTTP(s)
   - **Intervalo**: 10 minutos
   - **Método**: GET
3. ✅ **Resultado**: Render nunca dormirá, MongoDB siempre activo

### 🔧 **Otras Plataformas**
- Configurar `NODE_ENV=production`
- Usar URLs de producción para `API_BASE_URL`
- Si la plataforma tiene "sleep mode", configurar UptimeRobot

## 📈 Métricas de Rendimiento

### Middleware de Timing
Cada request incluye headers de performance:
- `X-Response-Time`: Tiempo de respuesta
- Logging automático de requests lentos

### Keep-Alive Stats
- Tiempo promedio de respuesta de MongoDB
- Rate de éxito de health checks
- Estadísticas de cold starts evitados

## 🔒 Seguridad

### Implementado
- ✅ Rate limiting
- ✅ JWT authentication con refresh tokens
- ✅ CORS configurado
- ✅ Middleware de autenticación
- ✅ Validación de datos con Zod

### Recomendaciones Adicionales
- [ ] Helmet.js para headers de seguridad
- [ ] Sanitización de datos adicional
- [ ] HTTPS en producción (Render lo provee automáticamente)

## 🐛 Debugging

### Logs de Keep-Alive
```bash
# Ver logs en tiempo real
tail -f logs/combined.log | grep "keep-alive"

# Logs de errores
tail -f logs/error.log
```

### Troubleshooting MongoDB
1. Verificar conectividad: `GET /health`
2. Revisar logs de keep-alive
3. Comprobar variables de entorno

## 📝 Changelog

### v2.3.0 - WebSocket Event Synchronization
- 🔧 Evento WebSocket `update-module` sincronizado con frontend
- 🔧 Corrección de nombres de eventos para comunicación en tiempo real
- ➕ Documentación completa de eventos WebSocket
- ✅ Integración perfecta frontend-backend para cambios de módulos

### v2.2.0 - Sistema de Auditoría de Módulos
- ➕ Campos `lastModifiedAt` y `lastModifiedBy` en ModuleStatus
- ➕ Campo `isBlocked` para bloquear módulos
- ➕ Populate automático de información del usuario
- ➕ Script de migración `npm run migrate:module-status`
- 🔧 Respuestas del servicio incluyen auditoría completa

### v2.1.0 - Doble Keep-Alive para Render
- ➕ Endpoint `/ping` optimizado para servicios externos
- ➕ Estrategia de doble keep-alive (interno + externo)
- ➕ Integración perfecta con UptimeRobot
- ➕ Solución completa para Render sleep mode
- ➕ Documentación de setup para UptimeRobot
- 🔧 Prevención total de cold starts

### v2.0.0 - Keep-Alive Implementation
- ➕ Sistema completo de keep-alive para MongoDB
- ➕ Cron jobs inteligentes
- ➕ Logging estructurado con Winston
- ➕ Health monitoring endpoint
- ➕ Graceful shutdown
- 🔧 Optimización de performance

### v1.0.0 - Initial Release
- ✅ Autenticación JWT
- ✅ CRUD de módulos
- ✅ WebSockets
- ✅ Rate limiting

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [`LICENSE`](LICENSE) para más detalles.

## 🆘 Soporte

### 🐛 **Troubleshooting**

#### **Problema: API lenta en primera carga**
```bash
# 1. Verificar si UptimeRobot está activo
curl https://tu-app.onrender.com/ping

# 2. Revisar logs de keep-alive
# En Render dashboard → Runtime Logs
```

#### **Problema: MongoDB connection timeout**
```bash
# Verificar estado de la base de datos
curl https://tu-app.onrender.com/health
# Buscar "database": "connected"
```

### 📞 **Contacto**
Para reportar bugs o solicitar features:
- Crear issue en GitHub
- Revisar logs en Render dashboard
- Verificar `/health` y `/ping` endpoints

---

**Desarrollado con ❤️ usando Node.js + TypeScript**