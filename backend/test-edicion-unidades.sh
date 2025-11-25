#!/bin/bash

# ============================================================================
# TEST: Edición de Unidades con Cambio de Tipo y Padre
# ============================================================================
# Prueba la capacidad de cambiar el tipo y padre de una unidad,
# actualizando recursivamente todas las unidades descendientes
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
echo "║   🧪 TEST: Edición de Unidades con Cambio de Tipo                    ║"
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
    exit 1
fi

echo -e "${GREEN}✅ Login exitoso${NC}"
echo ""

# ============================================================================
# 2. CREAR ESTRUCTURA DE PRUEBA
# ============================================================================
echo -e "${BLUE}2️⃣  Creando estructura de prueba...${NC}"

# Crear Zona de prueba
ZONA=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d '{
    "nombre": "Zona Test Edición",
    "tipo_unidad": "Zona",
    "codigo_unidad": "ZTEST01",
    "descripcion": "Zona para probar edición"
  }')

ZONA_ID=$(echo $ZONA | jq -r '.data.id')
echo "  ✅ Zona creada (ID: $ZONA_ID, Código: ZTEST01)"

# Crear Comandancia
CMD=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Comandancia Test\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $ZONA_ID
  }")

CMD_ID=$(echo $CMD | jq -r '.data.id')
CMD_CODIGO=$(echo $CMD | jq -r '.data.codigo_unidad')
echo "  ✅ Comandancia creada (ID: $CMD_ID, Código: $CMD_CODIGO)"

# Crear Compañía bajo Comandancia
CIA=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Compañía Test\",
    \"tipo_unidad\": \"Compañia\",
    \"parent_id\": $CMD_ID
  }")

CIA_ID=$(echo $CIA | jq -r '.data.id')
CIA_CODIGO=$(echo $CIA | jq -r '.data.codigo_unidad')
echo "  ✅ Compañía creada (ID: $CIA_ID, Código: $CIA_CODIGO)"

# Crear Puestos bajo Compañía
PTO1=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Puesto Test 1\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $CIA_ID
  }")

PTO1_ID=$(echo $PTO1 | jq -r '.data.id')
PTO1_CODIGO=$(echo $PTO1 | jq -r '.data.codigo_unidad')
echo "  ✅ Puesto 1 creado (ID: $PTO1_ID, Código: $PTO1_CODIGO)"

PTO2=$(curl -s -X POST "$BASE_URL/unidades" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Puesto Test 2\",
    \"tipo_unidad\": \"Puesto\",
    \"parent_id\": $CIA_ID
  }")

PTO2_ID=$(echo $PTO2 | jq -r '.data.id')
PTO2_CODIGO=$(echo $PTO2 | jq -r '.data.codigo_unidad')
echo "  ✅ Puesto 2 creado (ID: $PTO2_ID, Código: $PTO2_CODIGO)"

echo ""
echo "📊 Estructura creada:"
echo "  ZTEST01 (Zona)"
echo "  └── $CMD_CODIGO (Comandancia)"
echo "      └── $CIA_CODIGO (Compañía)"
echo "          ├── $PTO1_CODIGO (Puesto 1)"
echo "          └── $PTO2_CODIGO (Puesto 2)"
echo ""

# ============================================================================
# 3. MOVER COMPAÑÍA DIRECTAMENTE BAJO ZONA (Cambio de tipo requerido)
# ============================================================================
echo -e "${BLUE}3️⃣  Moviendo Compañía directamente bajo Zona...${NC}"
echo "   (Debe cambiar de Compañía a Comandancia)"
echo ""

BEFORE=$(curl -s -X GET "$BASE_URL/unidades/$CIA_ID" -b "$COOKIES_FILE")
echo "   Antes:"
echo "   • Tipo: $(echo $BEFORE | jq -r '.data.tipo_unidad')"
echo "   • Código: $(echo $BEFORE | jq -r '.data.codigo_unidad')"
echo "   • Padre: $(echo $BEFORE | jq -r '.data.parent_nombre')"
echo ""

# Cambiar padre y tipo
UPDATE=$(curl -s -X PUT "$BASE_URL/unidades/$CIA_ID" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -d "{
    \"nombre\": \"Comandancia Test (antes Compañía)\",
    \"tipo_unidad\": \"Comandancia\",
    \"parent_id\": $ZONA_ID
  }")

SUCCESS=$(echo $UPDATE | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo -e "   ${GREEN}✅ Actualización exitosa${NC}"
    UNIDADES_AFECTADAS=$(echo $UPDATE | jq -r '.unidades_actualizadas // 1')
    echo "   • Unidades actualizadas: $UNIDADES_AFECTADAS"
else
    echo -e "   ${RED}❌ Error en actualización${NC}"
    echo "   • Mensaje: $(echo $UPDATE | jq -r '.message')"
fi
echo ""

AFTER=$(curl -s -X GET "$BASE_URL/unidades/$CIA_ID" -b "$COOKIES_FILE")
echo "   Después:"
echo "   • Tipo: $(echo $AFTER | jq -r '.data.tipo_unidad')"
echo "   • Código: $(echo $AFTER | jq -r '.data.codigo_unidad')"
echo "   • Padre: $(echo $AFTER | jq -r '.data.parent_nombre')"
echo ""

# ============================================================================
# 4. VERIFICAR ACTUALIZACIÓN RECURSIVA DE DESCENDIENTES
# ============================================================================
echo -e "${BLUE}4️⃣  Verificando actualización de descendientes...${NC}"
echo ""

# Verificar Puesto 1 (ahora debe ser Compañía)
PTO1_AFTER=$(curl -s -X GET "$BASE_URL/unidades/$PTO1_ID" -b "$COOKIES_FILE")
echo "   Puesto 1 → Compañía:"
echo "   • Tipo anterior: Puesto"
echo "   • Tipo actual: $(echo $PTO1_AFTER | jq -r '.data.tipo_unidad')"
echo "   • Código anterior: $PTO1_CODIGO"
echo "   • Código actual: $(echo $PTO1_AFTER | jq -r '.data.codigo_unidad')"
if [ "$(echo $PTO1_AFTER | jq -r '.data.tipo_unidad')" == "Compañia" ]; then
    echo -e "   ${GREEN}✅ Tipo actualizado correctamente${NC}"
else
    echo -e "   ${RED}❌ Tipo no actualizado${NC}"
fi
echo ""

# Verificar Puesto 2 (ahora debe ser Compañía)
PTO2_AFTER=$(curl -s -X GET "$BASE_URL/unidades/$PTO2_ID" -b "$COOKIES_FILE")
echo "   Puesto 2 → Compañía:"
echo "   • Tipo anterior: Puesto"
echo "   • Tipo actual: $(echo $PTO2_AFTER | jq -r '.data.tipo_unidad')"
echo "   • Código anterior: $PTO2_CODIGO"
echo "   • Código actual: $(echo $PTO2_AFTER | jq -r '.data.codigo_unidad')"
if [ "$(echo $PTO2_AFTER | jq -r '.data.tipo_unidad')" == "Compañia" ]; then
    echo -e "   ${GREEN}✅ Tipo actualizado correctamente${NC}"
else
    echo -e "   ${RED}❌ Tipo no actualizado${NC}"
fi
echo ""

# ============================================================================
# 5. MOSTRAR ESTRUCTURA FINAL
# ============================================================================
echo -e "${BLUE}5️⃣  Estructura final:${NC}"
echo ""

ZONA_FINAL=$(curl -s -X GET "$BASE_URL/unidades/$ZONA_ID" -b "$COOKIES_FILE" | jq -r '.data.codigo_unidad')
CMD_FINAL=$(curl -s -X GET "$BASE_URL/unidades/$CIA_ID" -b "$COOKIES_FILE" | jq -r '.data.codigo_unidad')
CIA1_FINAL=$(curl -s -X GET "$BASE_URL/unidades/$PTO1_ID" -b "$COOKIES_FILE" | jq -r '.data.codigo_unidad')
CIA2_FINAL=$(curl -s -X GET "$BASE_URL/unidades/$PTO2_ID" -b "$COOKIES_FILE" | jq -r '.data.codigo_unidad')

echo "  $ZONA_FINAL (Zona)"
echo "  └── $CMD_FINAL (Comandancia) ← Era Compañía"
echo "      ├── $CIA1_FINAL (Compañía) ← Era Puesto 1"
echo "      └── $CIA2_FINAL (Compañía) ← Era Puesto 2"
echo ""

# ============================================================================
# 6. VALIDACIONES
# ============================================================================
echo -e "${BLUE}🔍 Validaciones finales:${NC}"
echo ""

validaciones=0
errores=0

# Validar que la antigua Compañía ahora es Comandancia
TIPO_CMD=$(echo $AFTER | jq -r '.data.tipo_unidad')
if [ "$TIPO_CMD" == "Comandancia" ]; then
    echo -e "${GREEN}✅${NC} Antigua Compañía ahora es Comandancia"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Antigua Compañía NO es Comandancia (es: $TIPO_CMD)"
    ((errores++))
fi

# Validar que los antiguos Puestos ahora son Compañías
TIPO_CIA1=$(echo $PTO1_AFTER | jq -r '.data.tipo_unidad')
if [ "$TIPO_CIA1" == "Compañia" ]; then
    echo -e "${GREEN}✅${NC} Antiguo Puesto 1 ahora es Compañía"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Antiguo Puesto 1 NO es Compañía (es: $TIPO_CIA1)"
    ((errores++))
fi

TIPO_CIA2=$(echo $PTO2_AFTER | jq -r '.data.tipo_unidad')
if [ "$TIPO_CIA2" == "Compañia" ]; then
    echo -e "${GREEN}✅${NC} Antiguo Puesto 2 ahora es Compañía"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Antiguo Puesto 2 NO es Compañía (es: $TIPO_CIA2)"
    ((errores++))
fi

# Validar códigos actualizados
if [[ "$CMD_FINAL" == ZTEST01-CMD* ]]; then
    echo -e "${GREEN}✅${NC} Código de Comandancia correcto ($CMD_FINAL)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Código de Comandancia incorrecto ($CMD_FINAL)"
    ((errores++))
fi

if [[ "$CIA1_FINAL" == ZTEST01-CMD*-CIA* ]]; then
    echo -e "${GREEN}✅${NC} Código de Compañía 1 correcto ($CIA1_FINAL)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Código de Compañía 1 incorrecto ($CIA1_FINAL)"
    ((errores++))
fi

if [[ "$CIA2_FINAL" == ZTEST01-CMD*-CIA* ]]; then
    echo -e "${GREEN}✅${NC} Código de Compañía 2 correcto ($CIA2_FINAL)"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Código de Compañía 2 incorrecto ($CIA2_FINAL)"
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
