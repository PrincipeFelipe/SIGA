#!/bin/bash

# Script de verificación del estado del servidor MCP GitHub
# Uso: ./check-mcp.sh

echo ""
echo "============================================================"
echo "🔍 VERIFICACIÓN DEL SERVIDOR MCP GITHUB"
echo "============================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si el puerto 4001 está en uso
echo -n "📡 Puerto 4001: "
if lsof -ti:4001 > /dev/null 2>&1; then
    PID=$(lsof -ti:4001)
    echo -e "${GREEN}✅ Ocupado (PID: $PID)${NC}"
    PORT_STATUS="OK"
else
    echo -e "${RED}❌ Libre (servidor no está corriendo)${NC}"
    PORT_STATUS="ERROR"
fi

echo ""

# Verificar health check
echo -n "🏥 Health Check: "
if [ "$PORT_STATUS" = "OK" ]; then
    HEALTH_RESPONSE=$(curl -s http://localhost:4001/health)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Servidor saludable${NC}"
        USER=$(echo "$HEALTH_RESPONSE" | grep -o '"user":"[^"]*"' | cut -d'"' -f4)
        echo "   Usuario GitHub: $USER"
    else
        echo -e "${RED}❌ Servidor no responde correctamente${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Saltado (servidor no está corriendo)${NC}"
fi

echo ""

# Verificar conexión a GitHub
echo -n "📦 GitHub API: "
if [ "$PORT_STATUS" = "OK" ]; then
    if echo "$HEALTH_RESPONSE" | grep -q '"github":"connected"'; then
        echo -e "${GREEN}✅ Conectado${NC}"
    else
        echo -e "${RED}❌ Desconectado${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  No verificado${NC}"
fi

echo ""

# Información del repositorio
if [ "$PORT_STATUS" = "OK" ]; then
    echo "📋 Información del repositorio:"
    REPO_INFO=$(curl -s http://localhost:4001/repo)
    echo "$REPO_INFO" | python3 -m json.tool 2>/dev/null | head -20 || echo "$REPO_INFO"
    echo ""
fi

# Resumen
echo "============================================================"
if [ "$PORT_STATUS" = "OK" ]; then
    echo -e "${GREEN}✅ Servidor MCP GitHub está OPERATIVO${NC}"
    echo ""
    echo "🔗 Endpoints disponibles:"
    echo "   • Health Check:     http://localhost:4001/health"
    echo "   • Info repositorio: http://localhost:4001/repo"
    echo "   • Ramas:            http://localhost:4001/branches"
    echo "   • Commits:          http://localhost:4001/commits"
    echo "   • Issues:           http://localhost:4001/issues"
    echo "   • Pull Requests:    http://localhost:4001/pulls"
else
    echo -e "${RED}❌ Servidor MCP GitHub NO ESTÁ CORRIENDO${NC}"
    echo ""
    echo "💡 Para iniciar el servidor:"
    echo "   cd /home/siga/Proyectos/SIGA/backend/mcp-github"
    echo "   npm run start-safe"
fi
echo "============================================================"
echo ""
