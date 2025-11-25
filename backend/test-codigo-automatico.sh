#!/bin/bash

# ============================================================================
# TEST: Generación Automática de Códigos de Unidad
# ============================================================================
# Prueba la nueva funcionalidad de generación automática de códigos
# para unidades subordinadas (Comandancia, Compañía, Puesto)
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
echo "║   🧪 TEST: Generación Automática de Códigos de Unidad                ║"
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
# 2. VERIFICAR ESTRUCTURA ACTUAL
# ============================================================================
echo -e "${BLUE}2️⃣  Verificando estructura actual de unidades...${NC}"

UNIDADES=$(curl -s -X GET "$BASE_URL/unidades/lista" \
  -b "$COOKIES_FILE")

echo "📋 Unidades existentes:"
echo $UNIDADES | jq -r '.data[] | "  • \(.tipo_unidad): \(.nombre) (\(.codigo_unidad // "sin código"))"' | head -10

# Buscar una zona para usar como padre
ZONA_ID=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Zona") | .id' | head -1)
ZONA_CODIGO=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Zona") | .codigo_unidad' | head -1)
ZONA_NOMBRE=$(echo $UNIDADES | jq -r '.data[] | select(.tipo_unidad == "Zona") | .nombre' | head -1)

echo ""
echo "🎯 Zona seleccionada para pruebas:"
echo "   ID: $ZONA_ID"
echo "   Nombre: $ZONA_NOMBRE"
echo "   Código: $ZONA_CODIGO"
echo ""

# ============================================================================
# 3. CREAR NUEVA ZONA CON CÓDIGO MANUAL
# ============================================================================
echo -e "${BLUE}3️⃣  Creando nueva Zona (código manual)...${NC}"

NEW_ZONA=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d '{
    "nombre": "Zona Test Automática",
    "tipo_unidad": "Zona",
    "codigo_unidad": "ZON99",
    "descripcion": "Zona de prueba para generación automática"
  }')

NEW_ZONA_ID=$(echo $NEW_ZONA | jq -r '.data.id // empty')

if [ -z "$NEW_ZONA_ID" ]; then
    echo -e "${RED}❌ Error creando zona${NC}"
    echo $NEW_ZONA | jq '.'
else
    echo -e "${GREEN}✅ Zona creada correctamente${NC}"
    echo "   ID: $NEW_ZONA_ID"
    echo "   Código: $(echo $NEW_ZONA | jq -r '.data.codigo_unidad')"
    ZONA_ID=$NEW_ZONA_ID
    ZONA_CODIGO="ZON99"
fi
echo ""

# ============================================================================
# 4. CREAR COMANDANCIA (CÓDIGO AUTOMÁTICO)
# ============================================================================
echo -e "${BLUE}4️⃣  Creando Comandancia bajo $ZONA_CODIGO (código automático)...${NC}"

CMD_1=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Comandancia Test Auto 1\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $ZONA_ID,
    \"descripcion\": \"Primera comandancia con código automático\"
  }")

CMD_1_ID=$(echo $CMD_1 | jq -r '.data.id // empty')
CMD_1_CODIGO=$(echo $CMD_1 | jq -r '.data.codigo_unidad // empty')

if [ -z "$CMD_1_ID" ]; then
    echo -e "${RED}❌ Error creando comandancia${NC}"
    echo $CMD_1 | jq '.'
else
    echo -e "${GREEN}✅ Comandancia 1 creada${NC}"
    echo "   ID: $CMD_1_ID"
    echo "   Código generado: $CMD_1_CODIGO"
    echo "   Esperado: ${ZONA_CODIGO}-CMD01"
    
    if [ "$CMD_1_CODIGO" == "${ZONA_CODIGO}-CMD01" ]; then
        echo -e "   ${GREEN}✅ Código correcto${NC}"
    else
        echo -e "   ${RED}⚠️  Código no coincide${NC}"
    fi
fi
echo ""

# ============================================================================
# 5. CREAR SEGUNDA COMANDANCIA
# ============================================================================
echo -e "${BLUE}5️⃣  Creando segunda Comandancia (código automático)...${NC}"

CMD_2=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Comandancia Test Auto 2\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $ZONA_ID,
    \"descripcion\": \"Segunda comandancia con código automático\"
  }")

CMD_2_ID=$(echo $CMD_2 | jq -r '.data.id // empty')
CMD_2_CODIGO=$(echo $CMD_2 | jq -r '.data.codigo_unidad // empty')

if [ -z "$CMD_2_ID" ]; then
    echo -e "${RED}❌ Error creando comandancia${NC}"
    echo $CMD_2 | jq '.'
else
    echo -e "${GREEN}✅ Comandancia 2 creada${NC}"
    echo "   ID: $CMD_2_ID"
    echo "   Código generado: $CMD_2_CODIGO"
    echo "   Esperado: ${ZONA_CODIGO}-CMD02"
    
    if [ "$CMD_2_CODIGO" == "${ZONA_CODIGO}-CMD02" ]; then
        echo -e "   ${GREEN}✅ Código correcto${NC}"
    else
        echo -e "   ${RED}⚠️  Código no coincide${NC}"
    fi
fi
echo ""

# ============================================================================
# 6. CREAR COMPAÑÍA
# ============================================================================
echo -e "${BLUE}6️⃣  Creando Compañía bajo $CMD_1_CODIGO (código automático)...${NC}"

CIA_1=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Compañía Test Auto 1\",
    \"tipo_unidad\": \"Compañia\",
    \"parent_id\": $CMD_1_ID,
    \"descripcion\": \"Primera compañía con código automático\"
  }")

CIA_1_ID=$(echo $CIA_1 | jq -r '.data.id // empty')
CIA_1_CODIGO=$(echo $CIA_1 | jq -r '.data.codigo_unidad // empty')

if [ -z "$CIA_1_ID" ]; then
    echo -e "${RED}❌ Error creando compañía${NC}"
    echo $CIA_1 | jq '.'
else
    echo -e "${GREEN}✅ Compañía 1 creada${NC}"
    echo "   ID: $CIA_1_ID"
    echo "   Código generado: $CIA_1_CODIGO"
    echo "   Esperado: ${CMD_1_CODIGO}-CIA01"
    
    if [ "$CIA_1_CODIGO" == "${CMD_1_CODIGO}-CIA01" ]; then
        echo -e "   ${GREEN}✅ Código correcto${NC}"
    else
        echo -e "   ${RED}⚠️  Código no coincide${NC}"
    fi
fi
echo ""

# ============================================================================
# 7. CREAR PUESTO
# ============================================================================
echo -e "${BLUE}7️⃣  Creando Puesto bajo $CIA_1_CODIGO (código automático)...${NC}"

PTO_1=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Puesto Test Auto 1\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $CIA_1_ID,
    \"descripcion\": \"Primer puesto con código automático\"
  }")

PTO_1_ID=$(echo $PTO_1 | jq -r '.data.id // empty')
PTO_1_CODIGO=$(echo $PTO_1 | jq -r '.data.codigo_unidad // empty')

if [ -z "$PTO_1_ID" ]; then
    echo -e "${RED}❌ Error creando puesto${NC}"
    echo $PTO_1 | jq '.'
else
    echo -e "${GREEN}✅ Puesto 1 creado${NC}"
    echo "   ID: $PTO_1_ID"
    echo "   Código generado: $PTO_1_CODIGO"
    echo "   Esperado: ${CIA_1_CODIGO}-PTO01"
    
    if [ "$PTO_1_CODIGO" == "${CIA_1_CODIGO}-PTO01" ]; then
        echo -e "   ${GREEN}✅ Código correcto${NC}"
    else
        echo -e "   ${RED}⚠️  Código no coincide${NC}"
    fi
fi
echo ""

# ============================================================================
# 8. CREAR SEGUNDO PUESTO
# ============================================================================
echo -e "${BLUE}8️⃣  Creando segundo Puesto (código automático)...${NC}"

PTO_2=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Puesto Test Auto 2\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $CIA_1_ID,
    \"descripcion\": \"Segundo puesto con código automático\"
  }")

PTO_2_ID=$(echo $PTO_2 | jq -r '.data.id // empty')
PTO_2_CODIGO=$(echo $PTO_2 | jq -r '.data.codigo_unidad // empty')

if [ -z "$PTO_2_ID" ]; then
    echo -e "${RED}❌ Error creando puesto${NC}"
    echo $PTO_2 | jq '.'
else
    echo -e "${GREEN}✅ Puesto 2 creado${NC}"
    echo "   ID: $PTO_2_ID"
    echo "   Código generado: $PTO_2_CODIGO"
    echo "   Esperado: ${CIA_1_CODIGO}-PTO02"
    
    if [ "$PTO_2_CODIGO" == "${CIA_1_CODIGO}-PTO02" ]; then
        echo -e "   ${GREEN}✅ Código correcto${NC}"
    else
        echo -e "   ${RED}⚠️  Código no coincide${NC}"
    fi
fi
echo ""

# ============================================================================
# 9. RESUMEN DE ESTRUCTURA CREADA
# ============================================================================
echo -e "${BLUE}9️⃣  Resumen de estructura creada:${NC}"
echo ""
echo "📊 Jerarquía de unidades:"
echo ""
echo "  $ZONA_CODIGO (Zona Test Automática)"
echo "  ├── $CMD_1_CODIGO (Comandancia Test Auto 1)"
echo "  │   └── $CIA_1_CODIGO (Compañía Test Auto 1)"
echo "  │       ├── $PTO_1_CODIGO (Puesto Test Auto 1)"
echo "  │       └── $PTO_2_CODIGO (Puesto Test Auto 2)"
echo "  └── $CMD_2_CODIGO (Comandancia Test Auto 2)"
echo ""

# ============================================================================
# 10. VALIDACIONES FINALES
# ============================================================================
echo -e "${BLUE}🔍 Validaciones finales:${NC}"
echo ""

# Verificar formato de códigos
validaciones=0
errores=0

# Zona
if [[ "$ZONA_CODIGO" =~ ^ZON[0-9]{2}$ ]]; then
    echo -e "${GREEN}✅${NC} Zona: Formato correcto (ZON##)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Zona: Formato incorrecto"
    ((errores++))
fi

# Comandancia 1
if [[ "$CMD_1_CODIGO" =~ ^ZON[0-9]{2}-CMD[0-9]{2}$ ]]; then
    echo -e "${GREEN}✅${NC} Comandancia 1: Formato correcto (ZON##-CMD##)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Comandancia 1: Formato incorrecto"
    ((errores++))
fi

# Comandancia 2
if [[ "$CMD_2_CODIGO" =~ ^ZON[0-9]{2}-CMD[0-9]{2}$ ]]; then
    echo -e "${GREEN}✅${NC} Comandancia 2: Formato correcto (ZON##-CMD##)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Comandancia 2: Formato incorrecto"
    ((errores++))
fi

# Compañía
if [[ "$CIA_1_CODIGO" =~ ^ZON[0-9]{2}-CMD[0-9]{2}-CIA[0-9]{2}$ ]]; then
    echo -e "${GREEN}✅${NC} Compañía: Formato correcto (ZON##-CMD##-CIA##)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Compañía: Formato incorrecto"
    ((errores++))
fi

# Puesto 1
if [[ "$PTO_1_CODIGO" =~ ^ZON[0-9]{2}-CMD[0-9]{2}-CIA[0-9]{2}-PTO[0-9]{2}$ ]]; then
    echo -e "${GREEN}✅${NC} Puesto 1: Formato correcto (ZON##-CMD##-CIA##-PTO##)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Puesto 1: Formato incorrecto"
    ((errores++))
fi

# Puesto 2
if [[ "$PTO_2_CODIGO" =~ ^ZON[0-9]{2}-CMD[0-9]{2}-CIA[0-9]{2}-PTO[0-9]{2}$ ]]; then
    echo -e "${GREEN}✅${NC} Puesto 2: Formato correcto (ZON##-CMD##-CIA##-PTO##)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Puesto 2: Formato incorrecto"
    ((errores++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errores -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS VALIDACIONES PASARON ($validaciones/$validaciones)${NC}"
else
    echo -e "${RED}❌ ALGUNAS VALIDACIONES FALLARON ($errores errores)${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cleanup
rm -f "$COOKIES_FILE"

echo "✅ Test completado"
echo ""
