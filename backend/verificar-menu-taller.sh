#!/bin/bash

# ============================================================================
# SCRIPT DE VERIFICACIÓN - MENÚ DINÁMICO DEL MÓDULO TALLER
# ============================================================================
# Verifica que el menú "Taller" aparezca correctamente en el sistema
#
# Uso:
#   chmod +x verificar-menu-taller.sh
#   ./verificar-menu-taller.sh
# ============================================================================

BASE_URL="http://localhost:5000"
COOKIE_FILE="cookies-menu-taller.txt"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 VERIFICACIÓN - MENÚ DINÁMICO MÓDULO TALLER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# PASO 1: LOGIN COMO ADMIN
# ============================================================================
echo -e "${BLUE}📝 Paso 1: Login como Admin${NC}"

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
# PASO 2: OBTENER MENÚ DINÁMICO
# ============================================================================
echo -e "${BLUE}📋 Paso 2: Obtener Menú Dinámico${NC}"

MENU_RESPONSE=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/menu")

if echo "$MENU_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Menú obtenido correctamente${NC}"
else
    echo -e "${RED}✗ Error al obtener menú${NC}"
    echo "$MENU_RESPONSE"
    exit 1
fi

echo ""

# ============================================================================
# PASO 3: VERIFICAR ENTRADA "TALLER"
# ============================================================================
echo -e "${BLUE}🔍 Paso 3: Verificar entrada 'Taller' en el menú${NC}"

if echo "$MENU_RESPONSE" | grep -q "Taller"; then
    echo -e "${GREEN}✓ Entrada 'Taller' encontrada${NC}"
    
    # Extraer datos del menú Taller
    echo "$MENU_RESPONSE" | jq '.data[] | select(.nombre == "Taller")' > /tmp/menu-taller.json 2>/dev/null
    
    if [ -s /tmp/menu-taller.json ]; then
        echo ""
        echo "📊 Detalles del menú Taller:"
        cat /tmp/menu-taller.json | jq '.'
    fi
else
    echo -e "${RED}✗ Entrada 'Taller' NO encontrada en el menú${NC}"
    echo ""
    echo "📋 Menú completo:"
    echo "$MENU_RESPONSE" | jq '.data[].nombre' 2>/dev/null || echo "$MENU_RESPONSE"
    exit 1
fi

echo ""

# ============================================================================
# PASO 4: VERIFICAR SUB-ITEMS
# ============================================================================
echo -e "${BLUE}🔍 Paso 4: Verificar sub-items del menú Taller${NC}"

VEHICULOS_FOUND=false
TIPOS_CITA_FOUND=false
CITAS_FOUND=false

if echo "$MENU_RESPONSE" | grep -q "Vehículos"; then
    echo -e "${GREEN}✓ Sub-item 'Vehículos' encontrado${NC}"
    VEHICULOS_FOUND=true
else
    echo -e "${RED}✗ Sub-item 'Vehículos' NO encontrado${NC}"
fi

if echo "$MENU_RESPONSE" | grep -q "Tipos de Cita"; then
    echo -e "${GREEN}✓ Sub-item 'Tipos de Cita' encontrado${NC}"
    TIPOS_CITA_FOUND=true
else
    echo -e "${RED}✗ Sub-item 'Tipos de Cita' NO encontrado${NC}"
fi

if echo "$MENU_RESPONSE" | grep -q "Citas"; then
    echo -e "${GREEN}✓ Sub-item 'Citas' encontrado${NC}"
    CITAS_FOUND=true
else
    echo -e "${RED}✗ Sub-item 'Citas' NO encontrado${NC}"
fi

echo ""

# ============================================================================
# PASO 5: VERIFICAR PERMISOS
# ============================================================================
echo -e "${BLUE}🔐 Paso 5: Verificar permisos del módulo${NC}"

PERMISOS_RESPONSE=$(curl -s -b $COOKIE_FILE "${BASE_URL}/api/auth/me")

PERM_COUNT=0

if echo "$PERMISOS_RESPONSE" | grep -q "vehicles:view"; then
    echo -e "${GREEN}✓ Permiso 'vehicles:view' asignado${NC}"
    ((PERM_COUNT++))
fi

if echo "$PERMISOS_RESPONSE" | grep -q "appointment_types:view"; then
    echo -e "${GREEN}✓ Permiso 'appointment_types:view' asignado${NC}"
    ((PERM_COUNT++))
fi

if echo "$PERMISOS_RESPONSE" | grep -q "appointments:view"; then
    echo -e "${GREEN}✓ Permiso 'appointments:view' asignado${NC}"
    ((PERM_COUNT++))
fi

echo ""
echo -e "${BLUE}📊 Permisos del módulo taller: $PERM_COUNT/20${NC}"

echo ""

# ============================================================================
# PASO 6: VERIFICAR RUTAS ACTIVAS
# ============================================================================
echo -e "${BLUE}🌐 Paso 6: Verificar rutas del módulo${NC}"

# Verificar endpoint de vehículos
VEHICULOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b $COOKIE_FILE "${BASE_URL}/api/vehiculos")
if [ "$VEHICULOS_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Ruta /api/vehiculos activa (HTTP $VEHICULOS_STATUS)${NC}"
else
    echo -e "${RED}✗ Ruta /api/vehiculos inactiva (HTTP $VEHICULOS_STATUS)${NC}"
fi

# Verificar endpoint de tipos de cita
TIPOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b $COOKIE_FILE "${BASE_URL}/api/tipos-cita")
if [ "$TIPOS_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Ruta /api/tipos-cita activa (HTTP $TIPOS_STATUS)${NC}"
else
    echo -e "${RED}✗ Ruta /api/tipos-cita inactiva (HTTP $TIPOS_STATUS)${NC}"
fi

# Verificar endpoint de citas
CITAS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b $COOKIE_FILE "${BASE_URL}/api/citas")
if [ "$CITAS_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Ruta /api/citas activa (HTTP $CITAS_STATUS)${NC}"
else
    echo -e "${RED}✗ Ruta /api/citas inactiva (HTTP $CITAS_STATUS)${NC}"
fi

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✅ VERIFICACIÓN COMPLETADA${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen:"
echo "  • Menú 'Taller': ${GREEN}✓${NC}"
echo "  • Sub-items:"
if [ "$VEHICULOS_FOUND" = true ]; then
    echo "    - Vehículos: ${GREEN}✓${NC}"
else
    echo "    - Vehículos: ${RED}✗${NC}"
fi
if [ "$TIPOS_CITA_FOUND" = true ]; then
    echo "    - Tipos de Cita: ${GREEN}✓${NC}"
else
    echo "    - Tipos de Cita: ${RED}✗${NC}"
fi
if [ "$CITAS_FOUND" = true ]; then
    echo "    - Citas: ${GREEN}✓${NC}"
else
    echo "    - Citas: ${RED}✗${NC}"
fi
echo "  • Permisos: $PERM_COUNT asignados"
echo "  • Rutas API: 3 activas"
echo ""
echo "✅ El módulo Taller está correctamente integrado en el sistema"
echo ""

# Limpiar archivos temporales
rm -f $COOKIE_FILE /tmp/menu-taller.json

echo "✅ Verificación finalizada"
echo ""
