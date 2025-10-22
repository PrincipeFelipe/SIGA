# 🚀 Inicio Automático de Servidores MCP

Guía para configurar los servidores MCP para que se inicien automáticamente al arrancar el sistema.

## 📋 Tabla de Contenidos

1. [Método 1: Servicios systemd (Recomendado)](#método-1-servicios-systemd)
2. [Método 2: Crontab @reboot](#método-2-crontab-reboot)
3. [Método 3: Script en /etc/rc.local](#método-3-script-en-etcrclocal)
4. [Gestión de Servicios](#gestión-de-servicios)
5. [Solución de Problemas](#solución-de-problemas)

---

## Método 1: Servicios systemd (Recomendado)

Los servicios systemd son la forma moderna y recomendada de gestionar servicios en Linux.

### ✅ Ventajas:
- Inicio/detención/reinicio fácil
- Logs centralizados con journalctl
- Reinicio automático si falla
- Dependencias de otros servicios
- Control de recursos

### 📝 Instalación:

**Paso 1: Ejecutar el script de instalación**

```bash
cd /home/siga/Proyectos/SIGA/backend
sudo bash install-mcp-services.sh
```

Este script automáticamente:
- ✅ Crea los archivos de servicio systemd
- ✅ Habilita el inicio automático
- ✅ Inicia los servicios
- ✅ Verifica que funcionen correctamente

**Paso 2: Verificar que los servicios están activos**

```bash
sudo systemctl status siga-mcp-mariadb
sudo systemctl status siga-mcp-github
```

**¡Listo!** Los servicios se iniciarán automáticamente en cada reinicio.

---

## Método 2: Crontab @reboot

Alternativa simple usando cron.

### 📝 Instalación:

```bash
# Editar crontab
crontab -e

# Agregar estas líneas al final:
@reboot sleep 30 && cd /home/siga/Proyectos/SIGA/backend/mcp-server && /usr/bin/node server.js >> /tmp/mcp-mariadb.log 2>&1 &
@reboot sleep 35 && cd /home/siga/Proyectos/SIGA/backend/mcp-github && /usr/bin/node server.js >> /tmp/mcp-github.log 2>&1 &

# Guardar y salir
```

**Verificar logs después de reiniciar:**
```bash
tail -f /tmp/mcp-mariadb.log
tail -f /tmp/mcp-github.log
```

---

## Método 3: Script en /etc/rc.local

Para sistemas que usan rc.local (menos común en sistemas modernos).

### 📝 Instalación:

```bash
# Editar rc.local
sudo nano /etc/rc.local

# Agregar antes de 'exit 0':
sleep 30
su - siga -c "cd /home/siga/Proyectos/SIGA/backend/mcp-server && /usr/bin/node server.js >> /tmp/mcp-mariadb.log 2>&1 &"
su - siga -c "cd /home/siga/Proyectos/SIGA/backend/mcp-github && /usr/bin/node server.js >> /tmp/mcp-github.log 2>&1 &"

# Dar permisos de ejecución
sudo chmod +x /etc/rc.local
```

---

## Gestión de Servicios

### Comandos para systemd (Método 1):

```bash
# Ver estado de los servicios
sudo systemctl status siga-mcp-mariadb
sudo systemctl status siga-mcp-github

# Iniciar servicios manualmente
sudo systemctl start siga-mcp-mariadb
sudo systemctl start siga-mcp-github

# Detener servicios
sudo systemctl stop siga-mcp-mariadb
sudo systemctl stop siga-mcp-github

# Reiniciar servicios
sudo systemctl restart siga-mcp-mariadb
sudo systemctl restart siga-mcp-github

# Habilitar inicio automático
sudo systemctl enable siga-mcp-mariadb
sudo systemctl enable siga-mcp-github

# Deshabilitar inicio automático
sudo systemctl disable siga-mcp-mariadb
sudo systemctl disable siga-mcp-github

# Ver logs en tiempo real
sudo journalctl -u siga-mcp-mariadb -f
sudo journalctl -u siga-mcp-github -f

# Ver logs completos
sudo journalctl -u siga-mcp-mariadb
sudo journalctl -u siga-mcp-github

# Ver últimas 50 líneas de logs
sudo journalctl -u siga-mcp-mariadb -n 50
sudo journalctl -u siga-mcp-github -n 50
```

### Verificar que los servicios funcionan:

```bash
# Health check MCP MariaDB
curl http://localhost:4000/health

# Health check MCP GitHub
curl http://localhost:4001/health

# Verificar procesos
ps aux | grep node

# Verificar puertos
sudo lsof -i:4000
sudo lsof -i:4001
```

---

## Solución de Problemas

### ❌ El servicio no inicia

**1. Ver los logs:**
```bash
sudo journalctl -u siga-mcp-mariadb -n 100
sudo journalctl -u siga-mcp-github -n 100
```

**2. Verificar archivos de servicio:**
```bash
cat /etc/systemd/system/siga-mcp-mariadb.service
cat /etc/systemd/system/siga-mcp-github.service
```

**3. Verificar permisos:**
```bash
ls -la /home/siga/Proyectos/SIGA/backend/mcp-server/
ls -la /home/siga/Proyectos/SIGA/backend/mcp-github/
```

**4. Probar inicio manual:**
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-server
node server.js
# Ctrl+C para detener

cd /home/siga/Proyectos/SIGA/backend/mcp-github
node server.js
# Ctrl+C para detener
```

### ❌ MCP MariaDB no conecta a la base de datos

**Verificar que MariaDB esté iniciado:**
```bash
sudo systemctl status mariadb
sudo systemctl start mariadb
```

**El servicio MCP debe iniciar DESPUÉS de MariaDB:**
```bash
# Verificar orden en el archivo de servicio
grep After /etc/systemd/system/siga-mcp-mariadb.service
# Debe contener: After=network.target mariadb.service
```

### ❌ MCP GitHub da error de autenticación

**Verificar token:**
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-github
grep GITHUB_TOKEN .env | cut -c1-25
```

**El archivo .env debe existir y tener el token configurado.**

### ❌ El servicio se detiene después de un tiempo

**Ver logs para encontrar el error:**
```bash
sudo journalctl -u siga-mcp-mariadb -n 200
sudo journalctl -u siga-mcp-github -n 200
```

**El servicio está configurado para reiniciarse automáticamente** (Restart=always).

---

## 📊 Comparación de Métodos

| Característica | systemd | crontab | rc.local |
|----------------|---------|---------|----------|
| **Recomendado** | ✅ Sí | ⚠️ Alternativa | ❌ Obsoleto |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Logs** | ✅ journalctl | ⚠️ Archivo manual | ⚠️ Archivo manual |
| **Reinicio auto** | ✅ Sí | ❌ No | ❌ No |
| **Control** | ✅ systemctl | ⚠️ kill manual | ⚠️ kill manual |
| **Moderno** | ✅ Sí | ✅ Sí | ❌ No |

---

## 🎯 Recomendación

**Usar el Método 1 (systemd)** por las siguientes razones:

1. ✅ **Control completo** - start, stop, restart, status
2. ✅ **Logs centralizados** - journalctl integrado
3. ✅ **Reinicio automático** - si el servicio falla, se reinicia solo
4. ✅ **Dependencias** - espera a que MariaDB esté listo
5. ✅ **Estándar moderno** - usado en todas las distribuciones actuales

---

## 📝 Archivo de servicios creados

Los archivos de servicio están en:
- `/etc/systemd/system/siga-mcp-mariadb.service`
- `/etc/systemd/system/siga-mcp-github.service`

Script de instalación:
- `/home/siga/Proyectos/SIGA/backend/install-mcp-services.sh`

---

## ✅ Verificación Final

Después de configurar el inicio automático:

1. **Reiniciar el sistema:**
   ```bash
   sudo reboot
   ```

2. **Después del reinicio, verificar:**
   ```bash
   # Verificar servicios
   sudo systemctl status siga-mcp-mariadb
   sudo systemctl status siga-mcp-github
   
   # Probar conexiones
   curl http://localhost:4000/health
   curl http://localhost:4001/health
   
   # Ver procesos
   ps aux | grep node
   ```

3. **Si todo funciona, verás:**
   - ✅ Servicios en estado "active (running)"
   - ✅ Health checks respondiendo correctamente
   - ✅ Procesos node ejecutándose

---

**¡Los servidores MCP ahora se iniciarán automáticamente!** 🎉
