#!/bin/bash

# ============================================================================
# SCRIPT DE INICIO - Backend + Frontend
# ============================================================================
# Inicia el backend (puerto 5000) y frontend (puerto 3000) simultáneamente
# ============================================================================

set -e  # Salir si hay algún error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🚀 Iniciando Sistema SIGA                           ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Directorio base del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# ============================================================================
# Función para limpiar procesos al salir
# ============================================================================
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    # Matar procesos de backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Backend detenido${NC}"
    fi
    
    # Matar procesos de frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend detenido${NC}"
    fi
    
    # Matar cualquier proceso residual en los puertos
    lsof -ti:5000 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✅ Servicios detenidos correctamente${NC}"
    exit 0
}

# Capturar señales de interrupción
trap cleanup SIGINT SIGTERM EXIT

# ============================================================================
# Detener procesos existentes
# ============================================================================
echo -e "\n${YELLOW}🧹 Limpiando procesos anteriores...${NC}"

# Detener backend existente
if lsof -ti:5000 > /dev/null 2>&1; then
    echo -e "${YELLOW}  → Deteniendo backend en puerto 5000...${NC}"
    lsof -ti:5000 | xargs -r kill -9
    sleep 1
fi

# Detener frontend existente
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}  → Deteniendo frontend en puerto 3000...${NC}"
    lsof -ti:3000 | xargs -r kill -9
    sleep 1
fi

echo -e "${GREEN}✓ Puertos liberados${NC}"

# ============================================================================
# Iniciar Backend (Puerto 5000)
# ============================================================================
echo -e "\n${BLUE}📦 Iniciando Backend...${NC}"

cd "$PROJECT_DIR/backend"

if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Error: No se encontró server.js en backend/${NC}"
    exit 1
fi

# Iniciar backend en segundo plano
node server.js > /tmp/siga-backend.log 2>&1 &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo -e "${YELLOW}  → Esperando a que el backend esté listo...${NC}"
for i in {1..30}; do
    if lsof -ti:5000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend iniciado correctamente (PID: $BACKEND_PID)${NC}"
        echo -e "${GREEN}  → http://localhost:5000${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Error: Backend no se inició en 30 segundos${NC}"
        echo -e "${YELLOW}Ver logs: tail -f /tmp/siga-backend.log${NC}"
        cleanup
        exit 1
    fi
    
    sleep 1
done

# ============================================================================
# Iniciar Frontend (Puerto 3000)
# ============================================================================
echo -e "\n${BLUE}🎨 Iniciando Frontend...${NC}"

cd "$PROJECT_DIR/frontend"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json en frontend/${NC}"
    cleanup
    exit 1
fi

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  → Instalando dependencias del frontend...${NC}"
    npm install
fi

# Iniciar frontend en segundo plano (sin abrir navegador)
BROWSER=none PORT=3000 npm start > /tmp/siga-frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar a que el frontend esté listo
echo -e "${YELLOW}  → Esperando a que el frontend esté listo...${NC}"
for i in {1..60}; do
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend iniciado correctamente (PID: $FRONTEND_PID)${NC}"
        echo -e "${GREEN}  → http://localhost:3000${NC}"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Error: Frontend no se inició en 60 segundos${NC}"
        echo -e "${YELLOW}Ver logs: tail -f /tmp/siga-frontend.log${NC}"
        cleanup
        exit 1
    fi
    
    sleep 1
done

# ============================================================================
# Sistema Iniciado
# ============================================================================
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Sistema SIGA iniciado correctamente               ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""
echo -e "${BLUE}📍 URLs:${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5000${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Backend:  ${YELLOW}tail -f /tmp/siga-backend.log${NC}"
echo -e "   Frontend: ${YELLOW}tail -f /tmp/siga-frontend.log${NC}"
echo -e ""
echo -e "${BLUE}🛑 Para detener:${NC}"
echo -e "   Presiona ${YELLOW}Ctrl+C${NC}"
echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Mantener el script corriendo y mostrar los logs en tiempo real
echo -e "\n${BLUE}📊 Monitoreando logs (Ctrl+C para detener)...${NC}\n"

# Mostrar logs combinados
tail -f /tmp/siga-backend.log /tmp/siga-frontend.log 2>/dev/null &
TAIL_PID=$!

# Esperar indefinidamente (hasta Ctrl+C)
wait
