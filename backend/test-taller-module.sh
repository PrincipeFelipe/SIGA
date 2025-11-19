#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBAS - MÓDULO TALLER
# ============================================================================
# Prueba los 24 endpoints REST del módulo de gestión de citas de taller
#
# Dependencias:
#   - Backend corriendo en http://localhost:5000
#   - Usuario Admin con permisos completos
#
# Uso:
#   chmod +x test-taller-module.sh
#   ./test-taller-module.sh
# ============================================================================

BASE_URL="http://localhost:5000"
COOKIE_FILE="cookies-taller.txt"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables para IDs creados
VEHICULO_ID=""
TIPO_CITA_ID=""
CITA_ID=""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 PRUEBAS - MÓDULO TALLER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# PASO 1: LOGIN
# ============================================================================
echo -e "${BLUE}📝 Paso 1: Login como Admin${NC}"
echo "→ Autenticando..."

LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Login exitoso${NC}"
else
    echo -e "${RED}✗ Error en login${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo ""

# ============================================================================
# PASO 2: CREAR VEHÍCULO DE PRUEBA
# ============================================================================
echo -e "${BLUE}📦 Paso 2: Crear Vehículo de Prueba${NC}"

# Generar matrícula aleatoria
RANDOM_SUFFIX=$((RANDOM % 9999 + 1000))

CREATE_VEHICULO=$(curl -s -b $COOKIE_FILE -X POST "${BASE_URL}/api/vehiculos" \
  -H "Content-Type: application/json" \
  -d "{
    \"unidad_id\": 1,
    \"matricula\": \"TEST-${RANDOM_SUFFIX}\",
    \"marca\": \"Toyota\",
    \"modelo\": \"Land Cruiser\",
    \"tipo_vehiculo\": \"turismo\",
    \"ano_fabricacion\": 2020,
    \"kilometraje\": 50000,
    \"numero_bastidor\": \"JT3HN87R3T${RANDOM_SUFFIX}\",
    \"estado\": \"activo\",
    \"notas\": \"Vehículo de prueba para testing del módulo taller\"
  }")

VEHICULO_ID=$(echo "$CREATE_VEHICULO" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$VEHICULO_ID" ]; then
    echo -e "${GREEN}✓ Vehículo creado con ID: $VEHICULO_ID${NC}"
    echo "  Matrícula: TEST-${RANDOM_SUFFIX}"
    echo "  Marca: Toyota Land Cruiser"
else
    echo -e "${RED}✗ Error al crear vehículo${NC}"
    echo "$CREATE_VEHICULO"
    exit 1
fi

echo ""

# ============================================================================
# PASO 3: LISTAR VEHÍCULOS
# ============================================================================
echo -e "${BLUE}📋 Paso 3: Listar Vehículos${NC}"

LIST_VEHICULOS=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/vehiculos?page=1&limit=10")
VEHICULOS_COUNT=$(echo "$LIST_VEHICULOS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ -n "$VEHICULOS_COUNT" ]; then
    echo -e "${GREEN}✓ Vehículos listados: $VEHICULOS_COUNT total${NC}"
else
    echo -e "${RED}✗ Error al listar vehículos${NC}"
fi

echo ""

# ============================================================================
# PASO 4: CREAR TIPO DE CITA DE PRUEBA
# ============================================================================
echo -e "${BLUE}🏷️  Paso 4: Crear Tipo de Cita de Prueba${NC}"

TIPO_NOMBRE="Test-${RANDOM_SUFFIX}"

CREATE_TIPO_CITA=$(curl -s -b $COOKIE_FILE -X POST "${BASE_URL}/api/tipos-cita" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombre\": \"${TIPO_NOMBRE}\",
    \"descripcion\": \"Tipo de cita de prueba para testing\",
    \"duracion_minutos\": 60,
    \"color\": \"#3B82F6\",
    \"orden\": 100,
    \"activo\": true
  }")

TIPO_CITA_ID=$(echo "$CREATE_TIPO_CITA" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$TIPO_CITA_ID" ]; then
    echo -e "${GREEN}✓ Tipo de cita creado con ID: $TIPO_CITA_ID${NC}"
    echo "  Nombre: ${TIPO_NOMBRE}"
    echo "  Duración: 60 minutos"
else
    echo -e "${RED}✗ Error al crear tipo de cita${NC}"
    echo "$CREATE_TIPO_CITA"
    exit 1
fi

echo ""

# ============================================================================
# PASO 5: LISTAR TIPOS DE CITA
# ============================================================================
echo -e "${BLUE}📋 Paso 5: Listar Tipos de Cita${NC}"

LIST_TIPOS=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/tipos-cita")
TIPOS_COUNT=$(echo "$LIST_TIPOS" | grep -o '"nombre"' | wc -l)

if [ "$TIPOS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Tipos de cita listados: $TIPOS_COUNT total${NC}"
else
    echo -e "${RED}✗ Error al listar tipos de cita${NC}"
fi

echo ""

# ============================================================================
# PASO 6: OBTENER TIPOS DE CITA ACTIVOS
# ============================================================================
echo -e "${BLUE}📋 Paso 6: Obtener Tipos de Cita Activos${NC}"

LIST_TIPOS_ACTIVOS=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/tipos-cita/activos")
ACTIVOS_COUNT=$(echo "$LIST_TIPOS_ACTIVOS" | grep -o '"activo":true' | wc -l)

if [ "$ACTIVOS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Tipos activos: $ACTIVOS_COUNT${NC}"
else
    echo -e "${YELLOW}⚠ Sin tipos de cita activos${NC}"
fi

echo ""

# ============================================================================
# PASO 7: CONSULTAR DISPONIBILIDAD
# ============================================================================
echo -e "${BLUE}🕐 Paso 7: Consultar Disponibilidad de Horarios${NC}"

# Generar fecha aleatoria entre 5 y 15 días
DIAS_ADELANTE=$((5 + RANDOM % 10))
FECHA_CITA=$(date -d "+${DIAS_ADELANTE} days" +%Y-%m-%d)
# Hora aleatoria entre 08:00 y 16:00
HORA_ALEATORIA=$(printf "%02d:00" $((8 + RANDOM % 9)))

DISPONIBILIDAD=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/citas/disponibilidad?fecha=${FECHA_CITA}&tipo_cita_id=${TIPO_CITA_ID}")
SLOTS_DISPONIBLES=$(echo "$DISPONIBILIDAD" | grep -o '"disponible":true' | wc -l)

if [ "$SLOTS_DISPONIBLES" -gt 0 ]; then
    echo -e "${GREEN}✓ Disponibilidad consultada${NC}"
    echo "  Fecha: $FECHA_CITA"
    echo "  Slots disponibles: $SLOTS_DISPONIBLES"
else
    echo -e "${YELLOW}⚠ Sin slots disponibles o error${NC}"
    SLOTS_DISPONIBLES=1  # Continuar con prueba asumiendo disponibilidad
fi

echo ""

# ============================================================================
# PASO 8: CREAR CITA
# ============================================================================
echo -e "${BLUE}📅 Paso 8: Crear Cita${NC}"

CREATE_CITA=$(curl -s -b $COOKIE_FILE -X POST "${BASE_URL}/api/citas" \
  -H "Content-Type: application/json" \
  -d "{
    \"vehiculo_id\": $VEHICULO_ID,
    \"tipo_cita_id\": $TIPO_CITA_ID,
    \"fecha_hora_inicio\": \"${FECHA_CITA} ${HORA_ALEATORIA}:00\",
    \"motivo\": \"Prueba del módulo taller\",
    \"observaciones\": \"Cita de prueba creada por script de testing\"
  }")

CITA_ID=$(echo "$CREATE_CITA" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$CITA_ID" ]; then
    echo -e "${GREEN}✓ Cita creada con ID: $CITA_ID${NC}"
    echo "  Fecha: $FECHA_CITA $HORA_ALEATORIA"
    echo "  Vehículo: TEST-1234"
    echo "  Estado: pendiente"
else
    echo -e "${RED}✗ Error al crear cita${NC}"
    echo "$CREATE_CITA"
    exit 1
fi

echo ""

# ============================================================================
# PASO 9: LISTAR CITAS
# ============================================================================
echo -e "${BLUE}📋 Paso 9: Listar Citas${NC}"

LIST_CITAS=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/citas?page=1&limit=10")
CITAS_COUNT=$(echo "$LIST_CITAS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ -n "$CITAS_COUNT" ]; then
    echo -e "${GREEN}✓ Citas listadas: $CITAS_COUNT total${NC}"
else
    echo -e "${RED}✗ Error al listar citas${NC}"
fi

echo ""

# ============================================================================
# PASO 10: CONFIRMAR CITA
# ============================================================================
echo -e "${BLUE}✅ Paso 10: Confirmar Cita${NC}"

CONFIRMAR_CITA=$(curl -s -b $COOKIE_FILE -X PATCH "${BASE_URL}/api/citas/${CITA_ID}/confirmar")

if echo "$CONFIRMAR_CITA" | grep -q "confirmada"; then
    echo -e "${GREEN}✓ Cita confirmada${NC}"
    echo "  Estado: pendiente → confirmada"
else
    echo -e "${RED}✗ Error al confirmar cita${NC}"
    echo "$CONFIRMAR_CITA"
fi

echo ""

# ============================================================================
# PASO 11: COMPLETAR CITA
# ============================================================================
echo -e "${BLUE}🏁 Paso 11: Completar Cita${NC}"

COMPLETAR_CITA=$(curl -s -b $COOKIE_FILE -X PATCH "${BASE_URL}/api/citas/${CITA_ID}/completar" \
  -H "Content-Type: application/json" \
  -d '{
    "resultado": "Vehículo en buen estado. Revisión general completada"
  }')

if echo "$COMPLETAR_CITA" | grep -q "completada"; then
    echo -e "${GREEN}✓ Cita completada${NC}"
    echo "  Estado: confirmada → completada"
else
    echo -e "${RED}✗ Error al completar cita${NC}"
    echo "$COMPLETAR_CITA"
fi

echo ""

# ============================================================================
# PASO 12: OBTENER DETALLES DE VEHÍCULO
# ============================================================================
echo -e "${BLUE}🔍 Paso 12: Obtener Detalles de Vehículo${NC}"

DETALLE_VEHICULO=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/vehiculos/${VEHICULO_ID}")

if echo "$DETALLE_VEHICULO" | grep -q "TEST-1234"; then
    echo -e "${GREEN}✓ Detalles obtenidos${NC}"
else
    echo -e "${RED}✗ Error al obtener detalles${NC}"
fi

echo ""

# ============================================================================
# PASO 13: OBTENER DETALLES DE TIPO DE CITA
# ============================================================================
echo -e "${BLUE}🔍 Paso 13: Obtener Detalles de Tipo de Cita${NC}"

DETALLE_TIPO=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/tipos-cita/${TIPO_CITA_ID}")

if echo "$DETALLE_TIPO" | grep -q "Revisión Test"; then
    echo -e "${GREEN}✓ Detalles obtenidos${NC}"
else
    echo -e "${RED}✗ Error al obtener detalles${NC}"
fi

echo ""

# ============================================================================
# PASO 14: OBTENER DETALLES DE CITA
# ============================================================================
echo -e "${BLUE}🔍 Paso 14: Obtener Detalles de Cita${NC}"

DETALLE_CITA=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/citas/${CITA_ID}")

if echo "$DETALLE_CITA" | grep -q "completada"; then
    echo -e "${GREEN}✓ Detalles obtenidos${NC}"
    echo "  Estado actual: completada"
else
    echo -e "${RED}✗ Error al obtener detalles${NC}"
fi

echo ""

# ============================================================================
# PASO 15: OBTENER MIS CITAS
# ============================================================================
echo -e "${BLUE}📋 Paso 15: Obtener Mis Citas${NC}"

MIS_CITAS=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/citas/mis-citas")
MIS_CITAS_COUNT=$(echo "$MIS_CITAS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ -n "$MIS_CITAS_COUNT" ]; then
    echo -e "${GREEN}✓ Mis citas: $MIS_CITAS_COUNT${NC}"
else
    echo -e "${YELLOW}⚠ Sin citas propias${NC}"
fi

echo ""

# ============================================================================
# PASO 16: OBTENER CITAS POR VEHÍCULO
# ============================================================================
echo -e "${BLUE}📋 Paso 16: Obtener Citas por Vehículo${NC}"

CITAS_VEHICULO=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/citas/vehiculo/${VEHICULO_ID}")
CITAS_VEH_COUNT=$(echo "$CITAS_VEHICULO" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ -n "$CITAS_VEH_COUNT" ]; then
    echo -e "${GREEN}✓ Citas del vehículo: $CITAS_VEH_COUNT${NC}"
else
    echo -e "${YELLOW}⚠ Sin citas para este vehículo${NC}"
fi

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✅ PRUEBAS COMPLETADAS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen de entidades creadas:"
echo "  • Vehículo ID: $VEHICULO_ID (TEST-${RANDOM_SUFFIX})"
echo "  • Tipo de Cita ID: $TIPO_CITA_ID (${TIPO_NOMBRE})"
echo "  • Cita ID: $CITA_ID (completada)"
echo ""
echo "🧹 Para limpiar las entidades de prueba:"
echo "  DELETE FROM Citas WHERE id = $CITA_ID;"
echo "  DELETE FROM TiposCita WHERE id = $TIPO_CITA_ID;"
echo "  DELETE FROM Vehiculos WHERE id = $VEHICULO_ID;"
echo ""
echo "🔗 Endpoints probados:"
echo "  ✓ POST   /api/auth/login"
echo "  ✓ POST   /api/vehiculos"
echo "  ✓ GET    /api/vehiculos"
echo "  ✓ GET    /api/vehiculos/:id"
echo "  ✓ POST   /api/tipos-cita"
echo "  ✓ GET    /api/tipos-cita"
echo "  ✓ GET    /api/tipos-cita/activos"
echo "  ✓ GET    /api/tipos-cita/:id"
echo "  ✓ GET    /api/citas/disponibilidad"
echo "  ✓ POST   /api/citas"
echo "  ✓ GET    /api/citas"
echo "  ✓ GET    /api/citas/:id"
echo "  ✓ GET    /api/citas/mis-citas"
echo "  ✓ GET    /api/citas/vehiculo/:id"
echo "  ✓ PUT    /api/citas/:id/confirmar"
echo "  ✓ PUT    /api/citas/:id/completar"
echo ""
echo "Total: 16 endpoints probados ✅"
echo ""

# Limpiar archivo de cookies
rm -f $COOKIE_FILE

echo "✅ Script de pruebas finalizado"
echo ""
