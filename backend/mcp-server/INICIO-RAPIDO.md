# 🚀 Inicio Rápido del Servidor MCP

## Comandos Esenciales

### Iniciar el servidor
```bash
cd /home/siga/Proyectos/SIGA/backend/mcp-server
npm run start-safe
```

### Verificar estado
```bash
./check-mcp.sh
# o
curl http://localhost:4000/health
```

### Detener el servidor
```bash
# Encontrar el PID
lsof -ti:4000

# Matar el proceso
kill -9 $(lsof -ti:4000)
```

### Reiniciar el servidor
```bash
# Matar proceso actual
kill -9 $(lsof -ti:4000) 2>/dev/null

# Esperar un momento
sleep 2

# Iniciar nuevamente
npm run start-safe
```

---

## 📝 Ejemplos de Consultas

### Health Check
```bash
curl http://localhost:4000/health
```

### Listar tablas
```bash
curl http://localhost:4000/tables
```

### Ejecutar consulta SQL
```bash
curl -X POST http://localhost:4000/query \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT DATABASE() as db"}'
```

### Ver estructura de tabla
```bash
curl http://localhost:4000/table/usuarios
```

---

## 🛠️ Solución Rápida de Problemas

### Error: Puerto ocupado
```bash
kill -9 $(lsof -ti:4000)
npm run start-safe
```

### Error: No se puede conectar a BD
```bash
# Verificar que MariaDB está corriendo
sudo systemctl status mariadb

# Verificar credenciales
cat .env
```

### Ver logs del servidor
```bash
ps aux | grep "node server.js"
```

---

## 📚 Documentación Completa

- **README completo:** `README.md`
- **Configuración exitosa:** `CONFIGURACION-EXITOSA.md`
- **Ejemplos de uso:** `ejemplos-uso.js`
- **Suite de pruebas:** `test-client.js`

---

**¡Listo para usar!** 🎉
