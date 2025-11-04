#!/bin/bash

# ============================================================================
# SCRIPT DE DETENCIÓN - Backend + Frontend
# ============================================================================
# Detiene todos los servicios del sistema SIGA
# ============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Deteniendo Sistema SIGA...${NC}\n"

# Detener backend
if lsof -ti:5000 > /dev/null 2>&1; then
    echo -e "${YELLOW}→ Deteniendo backend (puerto 5000)...${NC}"
    lsof -ti:5000 | xargs -r kill -9
    echo -e "${GREEN}✓ Backend detenido${NC}"
else
    echo -e "${GREEN}✓ Backend ya estaba detenido${NC}"
fi

# Detener frontend
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}→ Deteniendo frontend (puerto 3000)...${NC}"
    lsof -ti:3000 | xargs -r kill -9
    echo -e "${GREEN}✓ Frontend detenido${NC}"
else
    echo -e "${GREEN}✓ Frontend ya estaba detenido${NC}"
fi

# Limpiar procesos del script start-all.sh
pkill -f "start-all.sh" 2>/dev/null || true

echo -e "\n${GREEN}✅ Sistema SIGA detenido correctamente${NC}"
