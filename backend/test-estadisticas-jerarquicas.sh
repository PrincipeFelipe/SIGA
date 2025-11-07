#!/bin/bash

# Script de prueba de estadísticas jerárquicas
# Verifica que las estadísticas se filtran correctamente según el alcance del usuario

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 TEST: Estadísticas Jerárquicas de Tareas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000/api"

echo "📋 Contexto:"
echo "  • R84101K tiene alcance en Compañía Pamplona (ID 7)"
echo "  • Admin tiene permiso tasks:view_all (ve todo)"
echo ""

# Test 1: Usuario R84101K
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BLUE}TEST 1: Usuario R84101K (alcance: Compañía Pamplona)${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Login R84101K
echo "🔐 Login como R84101K..."
TOKEN_R84=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"R84101K","password":"klandemo"}' \
  -c /tmp/cookies-r84.txt | jq -r '.user.nombre_completo')

if [ "$TOKEN_R84" != "null" ] && [ "$TOKEN_R84" != "" ]; then
    echo "  ✓ Login exitoso: $TOKEN_R84"
else
    echo "  ✗ Error en login"
    exit 1
fi
echo ""

# Estadísticas personales
echo "${YELLOW}📊 Estadísticas Personales (global=false):${NC}"
STATS_PERSONAL=$(curl -s -X GET "$BASE_URL/tareas/estadisticas?global=false" \
  -b /tmp/cookies-r84.txt)

echo "$STATS_PERSONAL" | jq '.data' | sed 's/^/  /'
echo ""

# Estadísticas jerárquicas
echo "${YELLOW}📊 Estadísticas Jerárquicas (global=true):${NC}"
STATS_JERARQUICAS=$(curl -s -X GET "$BASE_URL/tareas/estadisticas?global=true" \
  -b /tmp/cookies-r84.txt)

echo "$STATS_JERARQUICAS" | jq '.data' | sed 's/^/  /'
echo ""

# Análisis
TOTAL_PERSONAL=$(echo "$STATS_PERSONAL" | jq -r '.data.total')
TOTAL_JERARQUICAS=$(echo "$STATS_JERARQUICAS" | jq -r '.data.total')

echo "📈 Análisis:"
echo "  • Tareas personales: $TOTAL_PERSONAL (asignadas a R84101K)"
echo "  • Tareas jerárquicas: $TOTAL_JERARQUICAS (ámbito de Compañía Pamplona)"
echo ""

if [ "$TOTAL_JERARQUICAS" -ge "$TOTAL_PERSONAL" ]; then
    echo "  ${GREEN}✓ Correcto: Las estadísticas jerárquicas incluyen más tareas${NC}"
else
    echo "  ${RED}✗ Error: Las estadísticas jerárquicas deberían incluir al menos las personales${NC}"
fi
echo ""

# Test 2: Usuario Admin
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BLUE}TEST 2: Usuario Admin (permiso: tasks:view_all)${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Login Admin
echo "🔐 Login como admin..."
TOKEN_ADMIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' \
  -c /tmp/cookies-admin.txt | jq -r '.user.nombre_completo')

if [ "$TOKEN_ADMIN" != "null" ] && [ "$TOKEN_ADMIN" != "" ]; then
    echo "  ✓ Login exitoso: $TOKEN_ADMIN"
else
    echo "  ✗ Error en login"
    exit 1
fi
echo ""

# Estadísticas jerárquicas admin
echo "${YELLOW}📊 Estadísticas Jerárquicas (global=true):${NC}"
STATS_ADMIN=$(curl -s -X GET "$BASE_URL/tareas/estadisticas?global=true" \
  -b /tmp/cookies-admin.txt)

echo "$STATS_ADMIN" | jq '.data' | sed 's/^/  /'
echo ""

TOTAL_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.data.total')

echo "📈 Análisis:"
echo "  • Admin ve todas las tareas: $TOTAL_ADMIN"
echo "  • R84101K ve tareas jerárquicas: $TOTAL_JERARQUICAS"
echo ""

if [ "$TOTAL_ADMIN" -ge "$TOTAL_JERARQUICAS" ]; then
    echo "  ${GREEN}✓ Correcto: Admin ve todas las tareas (≥ tareas de R84101K)${NC}"
else
    echo "  ${YELLOW}⚠ Advertencia: Admin debería ver al menos las mismas tareas que R84101K${NC}"
fi
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 RESUMEN DE RESULTADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "┌─────────────────────────────────┬──────────┬──────────────┐"
echo "│ Usuario                         │ Personal │ Jerárquicas  │"
echo "├─────────────────────────────────┼──────────┼──────────────┤"
printf "│ %-31s │ %8s │ %12s │\n" "R84101K" "$TOTAL_PERSONAL" "$TOTAL_JERARQUICAS"
printf "│ %-31s │ %8s │ %12s │\n" "Admin" "-" "$TOTAL_ADMIN"
echo "└─────────────────────────────────┴──────────┴──────────────┘"
echo ""

echo "✅ ${GREEN}Todos los tests completados${NC}"
echo ""
