# 🚀 Scripts de Inicio y Detención - Sistema SIGA

Este documento explica cómo usar los scripts para iniciar y detener el sistema SIGA de forma sencilla.

## 📋 Archivos Disponibles

- **`start-all.sh`** - Inicia backend y frontend simultáneamente
- **`stop-all.sh`** - Detiene todos los servicios

## 🎯 Uso Rápido

### Iniciar el Sistema

```bash
cd /home/siga/Proyectos/SIGA
./start-all.sh
```

### Detener el Sistema

```bash
cd /home/siga/Proyectos/SIGA
./stop-all.sh
```

O simplemente presiona **`Ctrl+C`** si el script está corriendo en primer plano.

## 📦 ¿Qué Hace `start-all.sh`?

El script realiza las siguientes acciones automáticamente:

1. ✅ **Limpia procesos anteriores** en los puertos 3000 y 5000
2. ✅ **Inicia el Backend** (Node.js en puerto 5000)
3. ✅ **Inicia el Frontend** (React en puerto 3000)
4. ✅ **Verifica** que ambos servicios estén corriendo
5. ✅ **Muestra los logs** en tiempo real
6. ✅ **Maneja la detención** limpia con Ctrl+C

## 🌐 URLs del Sistema

Una vez iniciado, el sistema estará disponible en:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 📊 Ver Logs

Los logs se guardan en archivos separados:

```bash
# Ver logs del backend
tail -f /tmp/siga-backend.log

# Ver logs del frontend
tail -f /tmp/siga-frontend.log

# Ver logs del script de inicio
tail -f /tmp/start-all-output.log
```

## 🔍 Verificar Estado

Para verificar si los servicios están corriendo:

```bash
# Verificar backend (puerto 5000)
lsof -i:5000

# Verificar frontend (puerto 3000)
lsof -i:3000
```

## 🐛 Solución de Problemas

### El script no inicia

```bash
# Verificar permisos de ejecución
ls -l start-all.sh

# Si no tiene permisos, ejecutar:
chmod +x start-all.sh
```

### Puerto ya en uso

El script automáticamente limpia los puertos, pero si persiste:

```bash
# Limpiar manualmente
lsof -ti:5000 | xargs -r kill -9
lsof -ti:3000 | xargs -r kill -9
```

### Ver errores de inicio

```bash
# Backend
tail -50 /tmp/siga-backend.log

# Frontend
tail -50 /tmp/siga-frontend.log
```

## ⚙️ Opciones Avanzadas

### Ejecutar en segundo plano

```bash
nohup ./start-all.sh > /tmp/start-all-output.log 2>&1 &
```

### Detener desde segundo plano

```bash
./stop-all.sh
```

## 🎨 Características del Script

- ✅ Colores en la terminal para mejor legibilidad
- ✅ Detección automática de errores
- ✅ Limpieza de procesos al salir
- ✅ Espera inteligente hasta que los servicios estén listos
- ✅ Mensajes informativos de estado
- ✅ Manejo de señales (SIGINT, SIGTERM)

## 📝 Ejemplo de Salida

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Iniciando Sistema SIGA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧹 Limpiando procesos anteriores...
✓ Puertos liberados

📦 Iniciando Backend...
  → Esperando a que el backend esté listo...
✓ Backend iniciado correctamente (PID: 12345)
  → http://localhost:5000

🎨 Iniciando Frontend...
  → Esperando a que el frontend esté listo...
✓ Frontend iniciado correctamente (PID: 12346)
  → http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Sistema SIGA iniciado correctamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 URLs:
   Backend:  http://localhost:5000
   Frontend: http://localhost:3000

📝 Logs:
   Backend:  tail -f /tmp/siga-backend.log
   Frontend: tail -f /tmp/siga-frontend.log

🛑 Para detener:
   Presiona Ctrl+C

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ⚡ Atajos Útiles

Para facilitar aún más el uso, puedes crear aliases en tu `~/.bashrc`:

```bash
# Agregar al final de ~/.bashrc
alias siga-start='cd /home/siga/Proyectos/SIGA && ./start-all.sh'
alias siga-stop='cd /home/siga/Proyectos/SIGA && ./stop-all.sh'
alias siga-logs-backend='tail -f /tmp/siga-backend.log'
alias siga-logs-frontend='tail -f /tmp/siga-frontend.log'
```

Luego recargar:
```bash
source ~/.bashrc
```

Y usar:
```bash
siga-start    # Iniciar sistema
siga-stop     # Detener sistema
```

## 🎯 Resumen

- **1 comando para iniciar todo**: `./start-all.sh`
- **1 comando para detener todo**: `./stop-all.sh`
- **Logs centralizados** en `/tmp/`
- **Limpieza automática** de procesos

¡Disfruta del desarrollo! 🚀
