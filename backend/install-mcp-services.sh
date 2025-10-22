#!/bin/bash

# Script de instalación de servicios systemd para servidores MCP
# Ejecutar con: sudo bash install-mcp-services.sh

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║     🔧 INSTALACIÓN DE SERVICIOS SYSTEMD PARA SERVIDORES MCP      ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ Este script debe ejecutarse como root (sudo)${NC}"
   echo "   Uso: sudo bash install-mcp-services.sh"
   exit 1
fi

echo -e "${BLUE}📋 Configurando servicios systemd...${NC}"
echo ""

# 1. Copiar archivos de servicio
echo -e "${YELLOW}1. Copiando archivos de servicio...${NC}"

cp /tmp/siga-mcp-mariadb.service /etc/systemd/system/
cp /tmp/siga-mcp-github.service /etc/systemd/system/

echo -e "${GREEN}   ✅ Archivos copiados${NC}"
echo ""

# 2. Recargar systemd
echo -e "${YELLOW}2. Recargando systemd...${NC}"
systemctl daemon-reload
echo -e "${GREEN}   ✅ Systemd recargado${NC}"
echo ""

# 3. Habilitar servicios
echo -e "${YELLOW}3. Habilitando servicios para inicio automático...${NC}"
systemctl enable siga-mcp-mariadb.service
systemctl enable siga-mcp-github.service
echo -e "${GREEN}   ✅ Servicios habilitados${NC}"
echo ""

# 4. Iniciar servicios
echo -e "${YELLOW}4. Iniciando servicios...${NC}"
systemctl start siga-mcp-mariadb.service
systemctl start siga-mcp-github.service
echo -e "${GREEN}   ✅ Servicios iniciados${NC}"
echo ""

# 5. Verificar estado
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Estado de los servicios:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# MCP MariaDB
if systemctl is-active --quiet siga-mcp-mariadb.service; then
    echo -e "${GREEN}✅ MCP MariaDB: ACTIVO${NC}"
else
    echo -e "${RED}❌ MCP MariaDB: INACTIVO${NC}"
fi

# MCP GitHub
if systemctl is-active --quiet siga-mcp-github.service; then
    echo -e "${GREEN}✅ MCP GitHub: ACTIVO${NC}"
else
    echo -e "${RED}❌ MCP GitHub: INACTIVO${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 6. Esperar 3 segundos y probar conexiones
echo -e "${YELLOW}Esperando 3 segundos para que los servicios se inicien...${NC}"
sleep 3

echo ""
echo -e "${BLUE}🧪 Probando conexiones:${NC}"
echo ""

# Probar MCP MariaDB
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP MariaDB respondiendo en http://localhost:4000${NC}"
else
    echo -e "${RED}❌ MCP MariaDB no responde${NC}"
fi

# Probar MCP GitHub
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP GitHub respondiendo en http://localhost:4001${NC}"
else
    echo -e "${RED}❌ MCP GitHub no responde${NC}"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║                  ✨ INSTALACIÓN COMPLETADA ✨                     ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Los servidores MCP ahora se iniciarán automáticamente al arrancar el sistema."
echo ""
echo "📋 Comandos útiles:"
echo ""
echo "   Ver estado:"
echo "   sudo systemctl status siga-mcp-mariadb"
echo "   sudo systemctl status siga-mcp-github"
echo ""
echo "   Ver logs:"
echo "   sudo journalctl -u siga-mcp-mariadb -f"
echo "   sudo journalctl -u siga-mcp-github -f"
echo ""
echo "   Reiniciar servicios:"
echo "   sudo systemctl restart siga-mcp-mariadb"
echo "   sudo systemctl restart siga-mcp-github"
echo ""
echo "   Detener servicios:"
echo "   sudo systemctl stop siga-mcp-mariadb"
echo "   sudo systemctl stop siga-mcp-github"
echo ""
echo "   Deshabilitar inicio automático:"
echo "   sudo systemctl disable siga-mcp-mariadb"
echo "   sudo systemctl disable siga-mcp-github"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
