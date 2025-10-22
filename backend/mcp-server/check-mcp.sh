#!/bin/bash

# Script de verificación del estado del servidor MCP
# Uso: ./check-mcp.sh

echo ""
echo "============================================================"
echo "🔍 VERIFICACIÓN DEL SERVIDOR MCP"
echo "============================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si el puerto 4000 está en uso
echo -n "📡 Puerto 4000: "
if lsof -ti:4000 > /dev/null 2>&1; then
    PID=$(lsof -ti:4000)
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
    HEALTH_RESPONSE=$(curl -s http://localhost:4000/health)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Servidor saludable${NC}"
        echo "   $HEALTH_RESPONSE"
    else
        echo -e "${RED}❌ Servidor no responde correctamente${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Saltado (servidor no está corriendo)${NC}"
fi

echo ""

# Verificar conexión a base de datos
echo -n "📊 Base de Datos: "
if [ "$PORT_STATUS" = "OK" ]; then
    if echo "$HEALTH_RESPONSE" | grep -q '"database":"connected"'; then
        echo -e "${GREEN}✅ Conectada${NC}"
    else
        echo -e "${RED}❌ Desconectada${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  No verificada${NC}"
fi

echo ""

# Información adicional
if [ "$PORT_STATUS" = "OK" ]; then
    echo "📋 Información del servidor:"
    INFO_RESPONSE=$(curl -s http://localhost:4000/)
    echo "$INFO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$INFO_RESPONSE"
    echo ""
fi

# Resumen
echo "============================================================"
if [ "$PORT_STATUS" = "OK" ]; then
    echo -e "${GREEN}✅ Servidor MCP está OPERATIVO${NC}"
    echo ""
    echo "🔗 Endpoints disponibles:"
    echo "   • Health Check:  http://localhost:4000/health"
    echo "   • Información:   http://localhost:4000/"
    echo "   • Tablas:        http://localhost:4000/tables"
    echo "   • Consultas:     http://localhost:4000/query (POST)"
else
    echo -e "${RED}❌ Servidor MCP NO ESTÁ CORRIENDO${NC}"
    echo ""
    echo "💡 Para iniciar el servidor:"
    echo "   cd /home/siga/Proyectos/SIGA/backend/mcp-server"
    echo "   npm run start-safe"
fi
echo "============================================================"
echo ""
