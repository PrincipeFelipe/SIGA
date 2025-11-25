#!/bin/bash

# ============================================================================
# TEST: Validación de Jerarquía Estricta de Unidades
# ============================================================================
# Prueba que solo se permiten tipos de unidades correctos según el padre:
# - Zona → Solo puede tener hijos Comandancia
# - Comandancia → Solo puede tener hijos Compañía
# - Compañía → Solo puede tener hijos Puesto
# - Puesto → No puede tener hijos
# ============================================================================

BASE_URL="http://localhost:5000/api"
COOKIES_FILE="/tmp/test-cookies.txt"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🧪 TEST: Validación de Jerarquía Estricta de Unidades              ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. LOGIN COMO ADMIN
# ============================================================================
echo -e "${BLUE}1️⃣  Login como admin...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIES_FILE" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }')

SUCCESS=$(echo $LOGIN_RESPONSE | jq -r '.success // empty')

if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Error en login${NC}"
    echo $LOGIN_RESPONSE | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ Login exitoso${NC}"
echo ""

# ============================================================================
# 2. OBTENER IDS DE UNIDADES EXISTENTES
# ============================================================================
echo -e "${BLUE}2️⃣  Obteniendo IDs de unidades para pruebas...${NC}"

UNIDADES=$(curl -s -X GET "$BASE_URL/unidades/lista" \
  -b "$COOKIES_FILE")

# Obtener IDs por tipo
ZONA_ID=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Zona" and .parent_id == null) | .id' | head -1)
ZONA_NOMBRE=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Zona" and .parent_id == null) | .nombre' | head -1)

CMD_ID=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Comandancia") | .id' | head -1)
CMD_NOMBRE=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Comandancia") | .nombre' | head -1)

CIA_ID=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Compañia") | .id' | head -1)
CIA_NOMBRE=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Compañia") | .nombre' | head -1)

PTO_ID=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Puesto") | .id' | head -1)
PTO_NOMBRE=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Puesto") | .nombre' | head -1)

echo "📋 Unidades para pruebas:"
echo "   Zona: $ZONA_NOMBRE (ID: $ZONA_ID)"
echo "   Comandancia: $CMD_NOMBRE (ID: $CMD_ID)"
echo "   Compañía: $CIA_NOMBRE (ID: $CIA_ID)"
echo "   Puesto: $PTO_NOMBRE (ID: $PTO_ID)"
echo ""

# ============================================================================
# 3. PRUEBAS DE VALIDACIÓN
# ============================================================================
echo -e "${BLUE}3️⃣  Iniciando pruebas de validación...${NC}"
echo ""

validaciones_exitosas=0
validaciones_fallidas=0

# ----------------------------------------------------------------------------
# TEST 1: Zona → Solo puede tener Comandancia
# ----------------------------------------------------------------------------
echo -e "${YELLOW}TEST 1: Zona debe permitir solo Comandancia${NC}"

# Intentar crear Comandancia bajo Zona (DEBE FUNCIONAR)
echo -n "  • Crear Comandancia bajo Zona... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Comandancia OK\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $ZONA_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ PERMITIDO (correcto)${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ BLOQUEADO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

# Intentar crear Compañía bajo Zona (DEBE FALLAR)
echo -n "  • Crear Compañía bajo Zona... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Compañía FAIL\",
    \"tipo_unidad\": \"Compañia\",
    \"parent_id\": $ZONA_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

# Intentar crear Puesto bajo Zona (DEBE FALLAR)
echo -n "  • Crear Puesto bajo Zona... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Puesto FAIL\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $ZONA_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

echo ""

# ----------------------------------------------------------------------------
# TEST 2: Comandancia → Solo puede tener Compañía
# ----------------------------------------------------------------------------
echo -e "${YELLOW}TEST 2: Comandancia debe permitir solo Compañía${NC}"

# Intentar crear Compañía bajo Comandancia (DEBE FUNCIONAR)
echo -n "  • Crear Compañía bajo Comandancia... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Compañía OK\",
    \"tipo_unidad\": \"Compañia\",
    \"parent_id\": $CMD_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ PERMITIDO (correcto)${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ BLOQUEADO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

# Intentar crear Comandancia bajo Comandancia (DEBE FALLAR)
echo -n "  • Crear Comandancia bajo Comandancia... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Comandancia FAIL\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $CMD_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

# Intentar crear Puesto bajo Comandancia (DEBE FALLAR)
echo -n "  • Crear Puesto bajo Comandancia... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Puesto FAIL\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $CMD_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

echo ""

# ----------------------------------------------------------------------------
# TEST 3: Compañía → Solo puede tener Puesto
# ----------------------------------------------------------------------------
echo -e "${YELLOW}TEST 3: Compañía debe permitir solo Puesto${NC}"

# Intentar crear Puesto bajo Compañía (DEBE FUNCIONAR)
echo -n "  • Crear Puesto bajo Compañía... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Puesto OK\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $CIA_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ PERMITIDO (correcto)${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ BLOQUEADO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

# Intentar crear Comandancia bajo Compañía (DEBE FALLAR)
echo -n "  • Crear Comandancia bajo Compañía... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Comandancia FAIL\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $CIA_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

# Intentar crear Compañía bajo Compañía (DEBE FALLAR)
echo -n "  • Crear Compañía bajo Compañía... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Compañía FAIL\",
    \"tipo_unidad\": \"Compañia\",
    \"parent_id\": $CIA_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

echo ""

# ----------------------------------------------------------------------------
# TEST 4: Puesto → No puede tener hijos
# ----------------------------------------------------------------------------
echo -e "${YELLOW}TEST 4: Puesto no debe permitir hijos${NC}"

# Intentar crear cualquier tipo bajo Puesto (DEBE FALLAR)
echo -n "  • Crear Puesto bajo Puesto... "
RESPONSE=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Test Puesto FAIL\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $PTO_ID
  }")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "false" ]; then
    echo -e "${GREEN}✅ BLOQUEADO (correcto)${NC}"
    MESSAGE=$(echo $RESPONSE | jq -r '.message')
    echo -e "     ${BLUE}Mensaje: $MESSAGE${NC}"
    ((validaciones_exitosas++))
else
    echo -e "${RED}❌ PERMITIDO (incorrecto)${NC}"
    ((validaciones_fallidas++))
fi

echo ""

# ============================================================================
# 4. RESUMEN FINAL
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RESUMEN DE VALIDACIONES:"
echo ""
echo "   ✅ Validaciones exitosas: $validaciones_exitosas"
echo "   ❌ Validaciones fallidas:  $validaciones_fallidas"
echo ""

if [ $validaciones_fallidas -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS VALIDACIONES PASARON${NC}"
    echo ""
    echo "Jerarquía estricta implementada correctamente:"
    echo "   ✅ Zona → Solo Comandancia"
    echo "   ✅ Comandancia → Solo Compañía"
    echo "   ✅ Compañía → Solo Puesto"
    echo "   ✅ Puesto → Sin hijos"
else
    echo -e "${RED}❌ ALGUNAS VALIDACIONES FALLARON${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cleanup
rm -f "$COOKIES_FILE"

echo "✅ Test completado"
echo ""
