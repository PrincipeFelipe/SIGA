#!/bin/bash
# ============================================================================
# TEST DE ENDPOINT DE MENÚ DINÁMICO
# ============================================================================

echo "🧪 Probando endpoint de menú dinámico"
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5000/api"

# 1. Login como admin
echo -e "${BLUE}1. Iniciando sesión como admin...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookies-test.txt -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# 2. Obtener menú
echo -e "${BLUE}2. Obteniendo menú dinámico...${NC}"
MENU_RESPONSE=$(curl -s -b cookies-test.txt "$BASE_URL/menu")

echo "$MENU_RESPONSE" | jq '.'
echo ""

# Verificar resultado
if echo "$MENU_RESPONSE" | jq -e '.success == true' > /dev/null; then
    TOTAL=$(echo "$MENU_RESPONSE" | jq '.total')
    echo -e "${GREEN}✅ Menú obtenido correctamente - $TOTAL aplicaciones disponibles${NC}"
    echo ""
    echo "Aplicaciones:"
    echo "$MENU_RESPONSE" | jq -r '.menu[] | "  - \(.nombre) (\(.ruta))"'
else
    echo -e "${RED}❌ Error obteniendo menú${NC}"
fi

echo ""

# 3. Login como usuario con menos permisos
echo -e "${BLUE}3. Iniciando sesión como usuario coordinador...${NC}"
LOGIN_RESPONSE2=$(curl -s -c cookies-test2.txt -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "coord.huesca", "password": "Coord123!"}')

echo "$LOGIN_RESPONSE2" | jq '.'
echo ""

# 4. Obtener menú de coordinador
echo -e "${BLUE}4. Obteniendo menú de coordinador...${NC}"
MENU_RESPONSE2=$(curl -s -b cookies-test2.txt "$BASE_URL/menu")

echo "$MENU_RESPONSE2" | jq '.'
echo ""

if echo "$MENU_RESPONSE2" | jq -e '.success == true' > /dev/null; then
    TOTAL2=$(echo "$MENU_RESPONSE2" | jq '.total')
    echo -e "${GREEN}✅ Menú de coordinador obtenido - $TOTAL2 aplicaciones disponibles${NC}"
    echo ""
    echo "Aplicaciones disponibles para coordinador:"
    echo "$MENU_RESPONSE2" | jq -r '.menu[] | "  - \(.nombre) (\(.ruta))"'
else
    echo -e "${RED}❌ Error obteniendo menú de coordinador${NC}"
fi

# Limpiar cookies temporales
rm -f cookies-test.txt cookies-test2.txt

echo ""
echo "========================================="
echo "✅ Prueba completada"
