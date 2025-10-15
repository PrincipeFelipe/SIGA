# Copilot Instructions

## Proyecto: Sistema de Gestión Administrativa Empresarial

### Objetivo
Este proyecto tiene como finalidad desarrollar una aplicación web completa para la gestión administrativa de una empresa. El sistema deberá incluir interfaces modernas, un backend robusto y una integración eficiente con base de datos.

---

### 🧱 Estructura del Proyecto
- **Frontend:** React + TailwindCSS
  - Crear componentes funcionales reutilizables.
  - Mantener una arquitectura de carpetas ordenada por vistas, componentes y servicios.
  - Implementar rutas usando React Router.
  - Usar Tailwind para todo el estilo visual, evitando CSS personalizado salvo casos específicos.

- **Backend:** Node.js + Express
  - Organizar endpoints por módulo (ej. usuarios, facturación, inventario).
  - Implementar middleware para autenticación, validación y manejo de errores.
  - Utilizar controladores claros y bien documentados.

- **Base de datos:** MariaDB
  - Datos de conexión:
    - Host: localhost
    - User: root
    - Password: klandemo
  - Mantener un archivo `.env` para variables sensibles.
  - Implementar ORM (Sequelize) o query builder para la comunicación con la base de datos.

---

### ⚙️ Instrucciones de ejecución
- Antes de inicializar el servidor de desarrollo, **Copilot debe verificar si algún proceso activo está utilizando el mismo puerto**.
  - Si detecta un proceso activo, deberá cerrarlo antes de relanzar el nuevo servidor.
- El lanzamiento de servidores se debe realizar **usando rutas absolutas**:
  - Ejemplo:
    - Frontend: `npm start --prefix /ruta/absoluta/frontend`
    - Backend: `npm start --prefix /ruta/absoluta/backend`
- Evitar el uso de rutas relativas o terminales en directorios incorrectos.

---

### 📘 Documentación continua
- Copilot debe crear y mantener actualizado el archivo `README.md`:
  - Incluir descripción del proyecto, tecnologías, instrucciones de instalación y ejecución.
  - Añadir nuevas funcionalidades, cambios y rutas API conforme se desarrollen.
  - Registrar cada modificación en una sección “Historial de Actualizaciones”.
- Copilot también debe **actualizar este archivo de instrucciones** conforme se añadan nuevos requerimientos o herramientas.
  - Ejemplo: si se agrega autenticación con JWT, debe documentarse tanto aquí como en el README.

---

### 🧩 Buenas prácticas
- Cada nueva función o API debe incluir comentarios descriptivos.
- Validar los datos antes de insertarlos en la base.
- Mantener el código modular y escalable.
- Seguir las convenciones de JavaScript (ES6+).
- Asegurar compatibilidad entre entornos de desarrollo y producción.

---

### 🚀 Misión de Copilot
1. Asistir en la creación y mejora del código según las tecnologías mencionadas.  
2. Mantener el entorno de desarrollo limpio y ordenado.  
3. Actualizar automáticamente la documentación (`README.md` y este archivo).  
4. Garantizar que los procesos se ejecuten de forma segura y eficiente.  

---