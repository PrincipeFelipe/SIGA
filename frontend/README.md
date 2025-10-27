# Frontend - SIGA (Sistema de Gestión Administrativa)

## 📋 Descripción

Aplicación web frontend desarrollada en React para el Sistema de Gestión Administrativa Empresarial (SIGA). Implementa una interfaz moderna con TailwindCSS siguiendo la identidad corporativa de la Guardia Civil.

## 🛠️ Tecnologías

- **React** 19.2.0 - Framework principal
- **TailwindCSS** 3.4.1 - Estilos y diseño responsive
- **React Router DOM** 7.9.4 - Enrutamiento
- **Axios** 1.12.2 - Cliente HTTP
- **js-cookie** 3.0.5 - Gestión de cookies
- **react-icons** 5.5.0 - Iconografía
- **recharts** 3.3.0 - Gráficos y visualizaciones

## 🎨 Identidad Corporativa

### Colores
- **Primary (Verde Guardia Civil):** `#004E2E` - Pantone 341C
- **Accent (Rojo):** `#C8102E` - Pantone 485C
- **Background:** `#F7F9FA` - Fondo claro neutro
- **Text:** `#1A1A1A` - Texto oscuro
- **Alert:** `#FFC700` - Amarillo - Pantone 116C

### Tipografías
- **Headings:** Montserrat (importada desde Google Fonts)
- **Body:** Inter (importada desde Google Fonts)

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/           # Componentes reutilizables
│   │   │   ├── Badge.js
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Input.js
│   │   │   ├── Loading.js
│   │   │   ├── Modal.js
│   │   │   └── index.js
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── Header.js
│   │   │   ├── Layout.js
│   │   │   └── Sidebar.js
│   │   └── auth/             # Componentes de autenticación
│   │       └── ProtectedRoute.js
│   ├── contexts/             # Contextos de React
│   │   └── AuthContext.js    # Gestión del estado de autenticación
│   ├── pages/                # Páginas de la aplicación
│   │   ├── auth/
│   │   │   ├── LoginPage.js
│   │   │   └── ChangePasswordPage.js
│   │   └── dashboard/
│   │       └── DashboardPage.js
│   ├── services/             # Servicios API
│   │   ├── api.js            # Configuración de Axios
│   │   └── authService.js    # Servicio de autenticación
│   ├── utils/                # Utilidades
│   ├── App.js                # Componente principal
│   ├── index.js              # Punto de entrada
│   └── index.css             # Estilos globales + Tailwind
├── .env                      # Variables de entorno
├── .env.example              # Ejemplo de variables de entorno
├── package.json
├── tailwind.config.js        # Configuración de TailwindCSS
└── postcss.config.js         # Configuración de PostCSS
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js v22.19.0 o superior
- NPM 10.x o superior
- Backend SIGA corriendo en `http://localhost:5000`

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install
```

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto frontend:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Ejecutar en Desarrollo

```bash
# Desde la raíz del proyecto SIGA
npm start --prefix /home/siga/Proyectos/SIGA/frontend

# O desde el directorio frontend
cd frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Build de Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `build/`.

## 📦 Componentes Implementados

### Componentes Comunes

#### Button
Botón reutilizable con múltiples variantes y estados.

**Props:**
- `variant`: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `icon`: React element

**Ejemplo:**
```jsx
<Button variant="primary" loading={isLoading}>
  Guardar
</Button>
```

#### Input
Campo de entrada con validación y estilos personalizados.

**Props:**
- `label`: string
- `name`: string
- `type`: 'text' | 'password' | 'email' | etc.
- `error`: string
- `helperText`: string
- `icon`: React element
- `required`: boolean

**Ejemplo:**
```jsx
<Input
  label="Usuario"
  name="username"
  icon={<FiUser />}
  error={errors.username}
  required
/>
```

#### Card
Contenedor tipo tarjeta para agrupar contenido.

**Props:**
- `title`: string
- `subtitle`: string
- `footer`: React element
- `padding`: boolean

**Ejemplo:**
```jsx
<Card title="Información" subtitle="Detalles del usuario">
  <p>Contenido...</p>
</Card>
```

#### Modal
Diálogo modal para formularios y confirmaciones.

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `footer`: React element

**Ejemplo:**
```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirmar">
  <p>¿Estás seguro?</p>
</Modal>
```

#### Badge
Etiqueta para estados y categorías.

**Props:**
- `variant`: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `rounded`: boolean

**Ejemplo:**
```jsx
<Badge variant="success">Activo</Badge>
```

#### Loading
Indicador de carga.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `text`: string
- `fullScreen`: boolean

**Ejemplo:**
```jsx
<Loading fullScreen text="Cargando..." />
```

### Layout

#### Layout
Wrapper principal que incluye Sidebar y Header.

**Uso:**
```jsx
<Layout>
  <DashboardPage />
</Layout>
```

#### Sidebar
Barra lateral de navegación con menú jerárquico.

#### Header
Cabecera con información del usuario, notificaciones y menú de acciones.

### Autenticación

#### ProtectedRoute
HOC para proteger rutas que requieren autenticación.

**Uso:**
```jsx
<Route path="/" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

## 🔐 Autenticación

### AuthContext
Context de React que gestiona el estado de autenticación global.

**Estado:**
- `user`: Objeto con datos del usuario autenticado
- `loading`: Boolean, indica si está verificando autenticación
- `isAuthenticated`: Boolean, estado de autenticación

**Métodos:**
- `login(username, password)`: Iniciar sesión
- `logout()`: Cerrar sesión
- `changePassword(currentPassword, newPassword)`: Cambiar contraseña
- `checkAuth()`: Verificar sesión actual

**Uso:**
```jsx
const { user, isAuthenticated, login, logout } = useAuth();
```

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. `authService.login()` envía POST a `/api/auth/login`
3. Backend valida y retorna JWT en cookie HttpOnly
4. `AuthContext` actualiza el estado con datos del usuario
5. Usuario es redirigido al Dashboard (`/`)
6. Si `require_password_change=true`, forzar cambio de contraseña

## 🛣️ Rutas

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/login` | LoginPage | No | Página de inicio de sesión |
| `/` | DashboardPage | Sí | Panel principal |
| `/cambiar-password` | ChangePasswordPage | Sí | Cambio de contraseña |
| `*` | Navigate to `/login` | - | Ruta por defecto |

## 📡 API Service

### Configuración de Axios

- **BaseURL:** `process.env.REACT_APP_API_URL || 'http://localhost:5000'`
- **Timeout:** 30000ms
- **withCredentials:** `true` (envía cookies HttpOnly automáticamente)

### Interceptores

#### Request Interceptor
- Agrega token CSRF desde cookies si existe

#### Response Interceptor
- **401 Unauthorized:** Redirige a `/login`
- **403 Forbidden:** Muestra error en consola
- **404 Not Found:** Muestra error en consola
- **429 Too Many Requests:** Muestra error en consola
- **500 Internal Server Error:** Muestra error en consola

## 🎨 Estilos y Temas

### TailwindCSS Customization

Configuración en `tailwind.config.js`:

```javascript
colors: {
  primary: '#004E2E',
  accent: '#C8102E',
  background: '#F7F9FA',
  text: '#1A1A1A',
  alert: '#FFC700'
},
fontFamily: {
  sans: ['Inter', 'sans-serif'],
  heading: ['Montserrat', 'sans-serif']
}
```

### Utilidades Personalizadas

Definidas en `index.css`:

- `.btn-primary`: Botón primario con hover
- `.btn-secondary`: Botón secundario
- `.btn-accent`: Botón de acento
- `.input-field`: Campo de entrada estilizado
- `.card`: Tarjeta con sombra
- `.badge-*`: Variantes de badges

### Animaciones

- `fadeIn`: Aparición gradual
- `slideIn`: Deslizamiento desde arriba

## 📊 Estado Actual

### ✅ Completado

- [x] Configuración de React + TailwindCSS
- [x] Estructura de carpetas
- [x] Componentes comunes (Button, Input, Card, Modal, Badge, Loading)
- [x] Layout (Sidebar, Header, Layout wrapper)
- [x] Autenticación (LoginPage, ChangePasswordPage, ProtectedRoute)
- [x] AuthContext (gestión de estado global)
- [x] API Service (Axios con interceptores)
- [x] Auth Service (login, logout, me, changePassword)
- [x] Dashboard básico
- [x] Rutas protegidas
- [x] Identidad corporativa aplicada

### ⏳ Pendiente

- [ ] Página de gestión de usuarios (CRUD)
- [ ] Página de gestión de unidades (árbol jerárquico)
- [ ] Página de gestión de roles y permisos
- [ ] Página de logs de auditoría
- [ ] Sistema de notificaciones
- [ ] Paginación y filtros en tablas
- [ ] Validaciones de formularios
- [ ] Mensajes de error/éxito (Toasts)
- [ ] Tests unitarios
- [ ] Tests E2E

## 🐛 Troubleshooting

### Error: Cannot find module 'package.json'

**Solución:** Usar ruta absoluta con `--prefix`
```bash
npm start --prefix /home/siga/Proyectos/SIGA/frontend
```

### Error: TailwindCSS not working

**Solución:** Asegurarse de que `postcss.config.js` está correcto y TailwindCSS 3.x instalado
```bash
npm install -D tailwindcss@3.4.1 autoprefixer postcss
```

### Error: Backend not responding

**Solución:** Verificar que el backend está corriendo en el puerto 5000
```bash
lsof -i :5000
# Si no está corriendo:
cd /home/siga/Proyectos/SIGA/backend && node server.js
```

## 📝 Notas de Desarrollo

- **TailwindCSS:** Se usa la versión 3.4.1 por compatibilidad con Create React App
- **Cookies HttpOnly:** El backend envía JWT en cookies HttpOnly, el frontend las envía automáticamente con `withCredentials: true`
- **Rutas Protegidas:** Todas las rutas excepto `/login` requieren autenticación
- **Estados de Carga:** Componentes muestran indicadores de carga durante operaciones asíncronas
- **Validación:** La validación se realiza tanto en cliente (React) como en servidor (Express)

## 🔗 Enlaces Útiles

- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

## 👥 Equipo

Desarrollado por el equipo de SIGA

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Última actualización:** 23 de octubre de 2025
