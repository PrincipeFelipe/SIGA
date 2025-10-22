#!/bin/bash

# Script para iniciar ambos servidores MCP
# Uso: ./start-all-mcp.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🚀 INICIANDO SERVIDORES MCP DEL SISTEMA SIGA        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="/home/siga/Proyectos/SIGA/backend"

# Función para verificar y matar proceso en puerto
kill_port() {
    local port=$1
    local name=$2
    
    if lsof -ti:$port > /dev/null 2>&1; then
        local pid=$(lsof -ti:$port)
        echo -e "${YELLOW}⚠️  Puerto $port ocupado por proceso $pid${NC}"
        echo -e "${BLUE}   Cerrando proceso...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}   ✅ Proceso cerrado${NC}"
    else
        echo -e "${GREEN}✅ Puerto $port disponible${NC}"
    fi
}

# 1. Iniciar MCP MariaDB
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 1. Servidor MCP MariaDB${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

kill_port 4000 "MCP MariaDB"

echo -e "${BLUE}   Iniciando servidor...${NC}"
cd "$BASE_DIR/mcp-server"
nohup node server.js > /tmp/mcp-mariadb.log 2>&1 &
MCP_DB_PID=$!
sleep 2

# Verificar si se inició correctamente
if ps -p $MCP_DB_PID > /dev/null; then
    echo -e "${GREEN}   ✅ MCP MariaDB iniciado (PID: $MCP_DB_PID)${NC}"
    echo -e "${GREEN}   📡 URL: http://localhost:4000${NC}"
else
    echo -e "${RED}   ❌ Error al iniciar MCP MariaDB${NC}"
    echo -e "${RED}   Ver logs: tail -f /tmp/mcp-mariadb.log${NC}"
fi

echo ""

# 2. Iniciar MCP GitHub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📦 2. Servidor MCP GitHub${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

kill_port 4001 "MCP GitHub"

# Verificar token de GitHub
cd "$BASE_DIR/mcp-github"
if grep -q "your_github_personal_access_token_here" .env 2>/dev/null || ! grep -q "GITHUB_TOKEN=" .env 2>/dev/null; then
    echo -e "${RED}   ⚠️  ADVERTENCIA: Token de GitHub no configurado${NC}"
    echo -e "${YELLOW}   El servidor funcionará con funcionalidad limitada${NC}"
    echo ""
fi

echo -e "${BLUE}   Iniciando servidor...${NC}"
nohup node server.js > /tmp/mcp-github.log 2>&1 &
MCP_GH_PID=$!
sleep 2

# Verificar si se inició correctamente
if ps -p $MCP_GH_PID > /dev/null; then
    echo -e "${GREEN}   ✅ MCP GitHub iniciado (PID: $MCP_GH_PID)${NC}"
    echo -e "${GREEN}   📡 URL: http://localhost:4001${NC}"
else
    echo -e "${RED}   ❌ Error al iniciar MCP GitHub${NC}"
    echo -e "${RED}   Ver logs: tail -f /tmp/mcp-github.log${NC}"
fi

echo ""

# Resumen
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                  ✨ RESUMEN DE SERVICIOS ✨                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if ps -p $MCP_DB_PID > /dev/null; then
    echo -e "  ${GREEN}✅ MCP MariaDB:  http://localhost:4000 (PID: $MCP_DB_PID)${NC}"
else
    echo -e "  ${RED}❌ MCP MariaDB:  No está corriendo${NC}"
fi

if ps -p $MCP_GH_PID > /dev/null; then
    echo -e "  ${GREEN}✅ MCP GitHub:   http://localhost:4001 (PID: $MCP_GH_PID)${NC}"
else
    echo -e "  ${RED}❌ MCP GitHub:   No está corriendo${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Comandos útiles:"
echo ""
echo "  Ver logs MariaDB:  tail -f /tmp/mcp-mariadb.log"
echo "  Ver logs GitHub:   tail -f /tmp/mcp-github.log"
echo ""
echo "  Verificar estado:  "
echo "    $BASE_DIR/mcp-server/check-mcp.sh"
echo "    $BASE_DIR/mcp-github/check-mcp.sh"
echo ""
echo "  Detener servicios:"
echo "    kill $MCP_DB_PID $MCP_GH_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
