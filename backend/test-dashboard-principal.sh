#!/bin/bash

# Script de prueba del Dashboard Principal con estadísticas jerárquicas
# Verifica que el dashboard muestra información correcta según permisos del usuario

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 TEST: Dashboard Principal - Estadísticas Jerárquicas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000/api"

echo "📋 Contexto:"
echo "  • Admin tiene permisos globales (ve todos los datos)"
echo "  • R84101K tiene permisos limitados a su ámbito jerárquico"
echo "  • Todos los usuarios ven sus tareas propias"
echo ""

# Test 1: Usuario Admin
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BLUE}TEST 1: Usuario Admin (permisos globales)${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Login Admin
echo "🔐 Login como admin..."
LOGIN_ADMIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' \
  -c /tmp/cookies-admin-dash.txt)

if echo "$LOGIN_ADMIN" | jq -e '.success' > /dev/null 2>&1; then
    NOMBRE_ADMIN=$(echo "$LOGIN_ADMIN" | jq -r '.user.nombre_completo')
    echo "  ✓ Login exitoso: $NOMBRE_ADMIN"
else
    echo "  ${RED}✗ Error en login${NC}"
    exit 1
fi
echo ""

# Obtener estadísticas admin
echo "${YELLOW}📊 Estadísticas del Dashboard:${NC}"
STATS_ADMIN=$(curl -s -X GET "$BASE_URL/dashboard/estadisticas" \
  -b /tmp/cookies-admin-dash.txt)

echo "$STATS_ADMIN" | jq '.' | sed 's/^/  /'
echo ""

# Análisis admin
USUARIOS_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.data.usuarios.total // "N/A"')
UNIDADES_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.data.unidades.total // "N/A"')
TAREAS_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.data.tareas.total // "N/A"')
TAREAS_PROPIAS_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.data.tareasPropias.total // "N/A"')

echo "📈 Resumen Admin:"
echo "  • Usuarios totales: $USUARIOS_ADMIN"
echo "  • Unidades totales: $UNIDADES_ADMIN"
echo "  • Tareas del ámbito: $TAREAS_ADMIN"
echo "  • Tareas propias: $TAREAS_PROPIAS_ADMIN"
echo ""

if [ "$USUARIOS_ADMIN" != "N/A" ] && [ "$UNIDADES_ADMIN" != "N/A" ] && [ "$TAREAS_ADMIN" != "N/A" ]; then
    echo "  ${GREEN}✓ Admin puede ver estadísticas de Usuarios, Unidades y Tareas${NC}"
else
    echo "  ${RED}✗ Admin debería poder ver todas las estadísticas${NC}"
fi
echo ""

# Test 2: Usuario R84101K
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BLUE}TEST 2: Usuario R84101K (permisos limitados)${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Login R84101K
echo "🔐 Login como R84101K..."
LOGIN_R84=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"R84101K","password":"klandemo"}' \
  -c /tmp/cookies-r84-dash.txt)

if echo "$LOGIN_R84" | jq -e '.success' > /dev/null 2>&1; then
    NOMBRE_R84=$(echo "$LOGIN_R84" | jq -r '.user.nombre_completo')
    UNIDAD_R84=$(echo "$LOGIN_R84" | jq -r '.user.unidad_destino.nombre')
    echo "  ✓ Login exitoso: $NOMBRE_R84"
    echo "  ✓ Unidad: $UNIDAD_R84"
else
    echo "  ${RED}✗ Error en login${NC}"
    exit 1
fi
echo ""

# Obtener estadísticas R84101K
echo "${YELLOW}📊 Estadísticas del Dashboard:${NC}"
STATS_R84=$(curl -s -X GET "$BASE_URL/dashboard/estadisticas" \
  -b /tmp/cookies-r84-dash.txt)

echo "$STATS_R84" | jq '.' | sed 's/^/  /'
echo ""

# Análisis R84101K
USUARIOS_R84=$(echo "$STATS_R84" | jq -r '.data.usuarios.total // "N/A"')
UNIDADES_R84=$(echo "$STATS_R84" | jq -r '.data.unidades.total // "N/A"')
TAREAS_R84=$(echo "$STATS_R84" | jq -r '.data.tareas.total // "N/A"')
TAREAS_PROPIAS_R84=$(echo "$STATS_R84" | jq -r '.data.tareasPropias.total')

echo "📈 Resumen R84101K:"
echo "  • Usuarios del ámbito: $USUARIOS_R84"
echo "  • Unidades del ámbito: $UNIDADES_R84"
echo "  • Tareas del ámbito: $TAREAS_R84"
echo "  • Tareas propias: $TAREAS_PROPIAS_R84"
echo ""

if [ "$USUARIOS_R84" != "N/A" ] && [ "$USUARIOS_R84" -lt "$USUARIOS_ADMIN" ]; then
    echo "  ${GREEN}✓ R84101K ve menos usuarios que Admin (filtrado correcto)${NC}"
else
    echo "  ${YELLOW}⚠ R84101K debería ver menos usuarios que Admin${NC}"
fi

if [ "$TAREAS_R84" != "N/A" ] && [ "$TAREAS_R84" -ge "$TAREAS_PROPIAS_R84" ]; then
    echo "  ${GREEN}✓ Tareas del ámbito ≥ Tareas propias (incluye jerárquicas)${NC}"
else
    echo "  ${YELLOW}⚠ Las tareas del ámbito deberían incluir al menos las tareas propias${NC}"
fi
echo ""

# Test 3: Comparación
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BLUE}TEST 3: Comparación Admin vs R84101K${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "┌─────────────────────┬──────────┬──────────┬────────────┐"
echo "│ Estadística         │  Admin   │ R84101K  │  Relación  │"
echo "├─────────────────────┼──────────┼──────────┼────────────┤"
printf "│ %-19s │ %8s │ %8s │ " "Usuarios" "$USUARIOS_ADMIN" "$USUARIOS_R84"
if [ "$USUARIOS_ADMIN" -ge "$USUARIOS_R84" ]; then
    echo "${GREEN}Admin ≥ R84${NC} │"
else
    echo "${RED}ERROR${NC}     │"
fi

printf "│ %-19s │ %8s │ %8s │ " "Unidades" "$UNIDADES_ADMIN" "$UNIDADES_R84"
if [ "$UNIDADES_ADMIN" -ge "$UNIDADES_R84" ]; then
    echo "${GREEN}Admin ≥ R84${NC} │"
else
    echo "${RED}ERROR${NC}     │"
fi

printf "│ %-19s │ %8s │ %8s │ " "Tareas (ámbito)" "$TAREAS_ADMIN" "$TAREAS_R84"
if [ "$TAREAS_ADMIN" -ge "$TAREAS_R84" ]; then
    echo "${GREEN}Admin ≥ R84${NC} │"
else
    echo "${RED}ERROR${NC}     │"
fi

printf "│ %-19s │ %8s │ %8s │ " "Tareas propias" "$TAREAS_PROPIAS_ADMIN" "$TAREAS_PROPIAS_R84"
echo "Individual │"

echo "└─────────────────────┴──────────┴──────────┴────────────┘"
echo ""

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 RESUMEN FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TESTS_PASSED=0
TESTS_TOTAL=5

# Test 1: Admin puede ver usuarios
if [ "$USUARIOS_ADMIN" != "N/A" ]; then
    echo "✅ Admin ve estadísticas de usuarios"
    ((TESTS_PASSED++))
else
    echo "❌ Admin NO ve estadísticas de usuarios"
fi

# Test 2: Admin puede ver unidades
if [ "$UNIDADES_ADMIN" != "N/A" ]; then
    echo "✅ Admin ve estadísticas de unidades"
    ((TESTS_PASSED++))
else
    echo "❌ Admin NO ve estadísticas de unidades"
fi

# Test 3: Admin puede ver tareas
if [ "$TAREAS_ADMIN" != "N/A" ]; then
    echo "✅ Admin ve estadísticas de tareas del ámbito"
    ((TESTS_PASSED++))
else
    echo "❌ Admin NO ve estadísticas de tareas del ámbito"
fi

# Test 4: R84101K ve filtrado jerárquico
if [ "$USUARIOS_R84" != "N/A" ] && [ "$USUARIOS_R84" -lt "$USUARIOS_ADMIN" ]; then
    echo "✅ R84101K ve filtrado jerárquico (menos datos que admin)"
    ((TESTS_PASSED++))
else
    echo "❌ R84101K NO ve filtrado jerárquico correcto"
fi

# Test 5: Tareas propias siempre visible
if [ "$TAREAS_PROPIAS_R84" -ge 0 ] && [ "$TAREAS_PROPIAS_ADMIN" -ge 0 ]; then
    echo "✅ Todos los usuarios ven sus tareas propias"
    ((TESTS_PASSED++))
else
    echo "❌ Las tareas propias NO se muestran correctamente"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Resultado: $TESTS_PASSED/$TESTS_TOTAL tests pasados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$TESTS_PASSED" -eq "$TESTS_TOTAL" ]; then
    echo "✅ ${GREEN}Todos los tests completados exitosamente${NC}"
    exit 0
else
    echo "⚠️  ${YELLOW}Algunos tests fallaron${NC}"
    exit 1
fi
