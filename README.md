# Portfolio Backend API 🚀

Backend RESTful API con WebSockets para sistema de gestión de portafolio web. Incluye autenticación JWT, sistema de contacto por email, gestión de módulos en tiempo real y optimizaciones de rendimiento para producción.

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│  Backend API     │◄──►│   MongoDB       │
│   (React/Next)  │    │  (Node.js/TS)    │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Socket.IO
           (Tiempo Real)
```

## ⚡ **Características Principales**

### 🔐 **Sistema de Autenticación**
- **JWT Tokens** con expiración de 1 hora
- **Refresh Tokens** para sesiones persistentes
- **Bcrypt** para hash seguro de contraseñas
- **Role-based access** (SuperAdmin)

### 📊 **Gestión de Módulos**
- **Control en tiempo real** del estado de módulos del portafolio
- **Socket.IO** para updates instantáneos a todos los clientes
- **Sistema de caché** para optimización de consultas
- **Toggle dinámico** de activación/desactivación

### 📧 **Sistema de Contacto**
- **Rate limiting** (3 requests/minuto) anti-spam
- **Validación robusta** con Zod schemas
- **Email automático** via Resend API
- **Formato HTML** profesional

### 🚀 **Optimizaciones de Rendimiento**
- **Caché en memoria** con TTL configurable
- **Consultas MongoDB optimizadas** con `.lean()`
- **Keep-alive service** para evitar cold starts en Render
- **Connection pooling** y timeouts configurados
- **Middleware de timing** para monitoreo

## 🛠️ **Stack Tecnológico**

| Categoría | Tecnologías |
|-----------|-------------|
| **Runtime** | Node.js, TypeScript |
| **Framework** | Express.js |
| **Base de Datos** | MongoDB + Mongoose |
| **Tiempo Real** | Socket.IO |
| **Autenticación** | JWT + Bcrypt |
| **Email** | Resend API |
| **Validación** | Zod |
| **Deployment** | Render |

## 📁 **Estructura del Proyecto**

```
src/
├── 🚀 index.ts              # Servidor principal optimizado
├── ⚙️  config/
│   └── db.ts                # Conexión MongoDB con pooling
├── 🎮 controllers/          # Lógica de negocio
│   ├── auth.controller.ts   # Login + JWT
│   ├── contact.controller.ts # Formulario contacto
│   ├── module.controller.ts # Gestión módulos + caché
│   └── refreshToken.controller.ts
├── 🛡️  middleware/          # Seguridad y optimización
│   ├── authMiddleware.ts    # Protección JWT
│   ├── rateLimit.ts         # Anti-spam
│   └── timing.ts            # Monitoreo rendimiento
├── 📊 models/               # Schemas MongoDB
│   ├── module.user.ts       # Usuarios admin
│   └── moduleStatus.model.ts # Estados módulos
├── 🛣️  routes/              # Definición APIs
├── 🔌 sockets/              # WebSocket handlers
├── 🎯 services/             # Servicios externos
└── 🔧 utils/                # Utilidades + caché
```

## 🚀 **Instalación y Configuración**

### **1. Clonar Repositorio**
```bash
git clone <repository-url>
cd portfolio-backend
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Variables de Entorno**
Crear archivo `.env`:
```env
# Base de Datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/portfolio

# JWT
JWT_SECRET=tu-jwt-secret-muy-seguro
JWT_REFRESH_SECRET=tu-refresh-secret

# Email Service
RESEND_API_KEY=re_tu-resend-api-key

# Servidor
PORT=4000
NODE_ENV=development

# Optimizaciones (Producción)
MONGODB_MAX_POOL_SIZE=10
CACHE_TTL=30000
```

### **4. Scripts Disponibles**

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | **Desarrollo** con hot reload |
| `npm run build` | **Compilar** TypeScript |
| `npm start` | **Ejecutar** versión compilada |
| `npm run hash` | **Generar** hash de contraseña |

## 📡 **Endpoints API**

### **🔐 Autenticación**
```http
POST /auth/login
Content-Type: application/json
{
  "email": "admin@portfolio.com",
  "password": "password"
}

POST /auth/refresh-token
Content-Type: application/json
{
  "refreshToken": "jwt-refresh-token"
}
```

### **📊 Gestión de Módulos**
```http
# Obtener estados (público, con caché)
GET /modules
Response: {
  "status": "success",
  "data": [...],
  "cached": true/false
}

# Toggle estado (requiere autenticación)
POST /modules/toggle
Authorization: Bearer jwt-token
Content-Type: application/json
{
  "moduleName": "nasaGallery"
}
```

### **📧 Contacto**
```http
POST /contact
Content-Type: application/json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "message": "Mensaje de contacto aquí..."
}
```

### **💚 Health Check**
```http
GET /health
Response: {
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔌 **WebSocket Events**

### **Cliente → Servidor**
```javascript
// Conexión automática
socket.on('connect', () => {
  console.log('Conectado al servidor');
});
```

### **Servidor → Cliente**
```javascript
// Estado inicial al conectar
socket.on('initialModuleStatuses', (modules) => {
  console.log('Estados iniciales:', modules);
});

// Cambios en tiempo real
socket.on('moduleStatusChanged', ({ moduleName, isActive }) => {
  console.log(`${moduleName}: ${isActive ? 'Activado' : 'Desactivado'}`);
});
```

## 🚀 **Deployment en Producción**

### **Render.com (Actual)**
```bash
# URL de Producción
https://portfolio-backend-1-kacy.onrender.com

# Configuración automática con:
- Build Command: npm run build
- Start Command: npm start
- Node.js 18+
```

### **Variables de Entorno en Render**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret
RESEND_API_KEY=re_...
PORT=4000
```

### **Optimizaciones de Producción Activas**

#### 🎯 **Sistema de Caché**
- **TTL**: 30 segundos para consultas de módulos
- **Invalidación**: Automática en cambios de estado
- **Memoria**: Caché en RAM para máximo rendimiento

#### ⚡ **Keep-Alive Service**
```javascript
// Ping cada 14 minutos para evitar sleep de Render
setupKeepAlive('https://portfolio-backend-1-kacy.onrender.com/health');
```

#### 🔍 **Monitoreo de Rendimiento**
```javascript
// Logs automáticos de timing
GET /modules - 200 - 45ms ✅
POST /modules/toggle - 200 - 120ms ⚠️
SLOW REQUEST: POST /contact took 1200ms 🐌
```

#### 🏎️ **Consultas Optimizadas**
```javascript
// Mongoose optimizado
ModuleStatus.find({})
  .select('moduleName isActive name')  // Solo campos necesarios
  .lean()                             // Objetos JS puros
  .maxTimeMS(5000);                   // Timeout 5s
```

## 📊 **Métricas de Rendimiento**

### **Antes de Optimizaciones**
- `/modules`: ~2-5 segundos (cold start)
- Consultas BD: ~800-1500ms
- Memory usage: Alto por objetos Mongoose

### **Después de Optimizaciones**
- `/modules`: ~50-200ms (con caché)
- Consultas BD: ~100-300ms (con .lean())
- Memory usage: Reducido 60%
- Cold starts: Eliminados con keep-alive

## 🔧 **Desarrollo Local**

### **Configuración Inicial**
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar MongoDB local o Atlas
# 3. Configurar variables .env
# 4. Iniciar en desarrollo
npm run dev

# El servidor estará en http://localhost:4000
```

### **Testing WebSockets**
```bash
# Abrir public/index.html en navegador
# O usar cliente Socket.IO
const socket = io('http://localhost:4000');
```

### **Crear Usuario Admin**
```bash
# Generar hash de contraseña
npm run hash

# Insertar en MongoDB
db.users.insertOne({
  email: "admin@portfolio.com",
  password: "hash-generado",
  role: "superAdmin",
  name: "Admin",
  permissions: ["modules:toggle"]
});
```

## 🛡️ **Seguridad Implementada**

| Aspecto | Implementación |
|---------|---------------|
| **Contraseñas** | Bcrypt hash + salt |
| **Tokens** | JWT con expiración |
| **Rate Limiting** | 3 req/min en /contact |
| **CORS** | Configurado por dominio |
| **Validación** | Zod schemas estrictos |
| **Timeouts** | MongoDB 5s máximo |

## 🌐 **CORS y Dominios**

```javascript
// Desarrollo
origin: ['http://localhost:3000']

// Producción  
origin: ['https://tu-frontend-url.com']
```

## 📈 **Escalabilidad**

### **Actual (Render Free Tier)**
- 1 instancia
- 512MB RAM
- Sleep después 15min inactividad

### **Escalabilidad Futura**
- **Horizontal**: Múltiples instancias + Load Balancer
- **Caché**: Redis para caché distribuido  
- **BD**: MongoDB Atlas con réplicas
- **CDN**: Para assets estáticos

## 🐛 **Debugging y Logs**

### **Logs Estructurados**
```javascript
// Conexión BD
MongoDB Connected: cluster0-shard-00-00.mongodb.net

// Timing requests
GET /modules - 200 - 45ms

// Keep alive
Keep alive ping: 200

// Errores
Error getting module statuses: MongoTimeoutError
```

### **Health Monitoring**
```bash
# Check health
curl https://portfolio-backend-1-kacy.onrender.com/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🤝 **Contribuir**

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para detalles.

---

## 🔗 **Enlaces Útiles**

- **API en Producción**: https://portfolio-backend-1-kacy.onrender.com
- **Health Check**: https://portfolio-backend-1-kacy.onrender.com/health
- **Documentación MongoDB**: https://mongoosejs.com/
- **Socket.IO Docs**: https://socket.io/docs/
- **Render Deployment**: https://render.com/docs

---

**Desarrollado con ❤️ para un portafolio web moderno y eficiente**