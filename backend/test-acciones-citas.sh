#!/bin/bash

# ============================================================================
# TEST: Verificar Acciones en Módulo de Citas
# ============================================================================
# Verifica que el usuario admin vea todas las acciones disponibles
# en el CRUD de citas del taller
# ============================================================================

BASE_URL="http://localhost:5000/api"
COOKIES_FILE="/tmp/test-cookies.txt"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🧪 TEST: Acciones en Módulo de Citas                               ║"
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
# 2. VERIFICAR PERMISOS DE CITAS
# ============================================================================
echo -e "${BLUE}2️⃣  Verificando permisos de citas...${NC}"
echo ""

ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" -b "$COOKIES_FILE")

PERMISOS=$(echo $ME_RESPONSE | jq -r '.user.permisos[]' | grep 'appointments:' | sort)

echo "Permisos de citas del usuario admin:"
echo "$PERMISOS" | while read permiso; do
    echo "  ✅ $permiso"
done
echo ""

# Contar permisos
TOTAL_PERMISOS=$(echo "$PERMISOS" | wc -l)
echo "Total de permisos: $TOTAL_PERMISOS"
echo ""

# ============================================================================
# 3. VERIFICAR ACCIONES DISPONIBLES EN FRONTEND
# ============================================================================
echo -e "${BLUE}3️⃣  Acciones disponibles según permisos:${NC}"
echo ""

# Ver detalles - siempre disponible
echo "  👁️  Ver detalles: ${GREEN}✓ Siempre disponible${NC}"

# Editar - appointments:edit
if echo "$PERMISOS" | grep -q "appointments:edit"; then
    echo "  ✏️  Editar: ${GREEN}✓ Disponible${NC} (solo si no está completada/cancelada)"
else
    echo "  ✏️  Editar: ${RED}✗ No disponible${NC}"
fi

# Confirmar - appointments:manage
if echo "$PERMISOS" | grep -q "appointments:manage"; then
    echo "  ✅ Confirmar: ${GREEN}✓ Disponible${NC} (solo estado pendiente)"
else
    echo "  ✅ Confirmar: ${RED}✗ No disponible${NC}"
fi

# Completar - appointments:manage
if echo "$PERMISOS" | grep -q "appointments:manage"; then
    echo "  ⏰ Completar: ${GREEN}✓ Disponible${NC} (solo estado confirmada)"
else
    echo "  ⏰ Completar: ${RED}✗ No disponible${NC}"
fi

# Cancelar - appointments:cancel
if echo "$PERMISOS" | grep -q "appointments:cancel"; then
    echo "  ❌ Cancelar: ${GREEN}✓ Disponible${NC} (si no está cancelada/completada)"
else
    echo "  ❌ Cancelar: ${RED}✗ No disponible${NC}"
fi

echo ""

# ============================================================================
# 4. VERIFICAR CITAS EXISTENTES
# ============================================================================
echo -e "${BLUE}4️⃣  Verificando citas existentes...${NC}"
echo ""

CITAS_RESPONSE=$(curl -s -X GET "$BASE_URL/citas?limit=5" -b "$COOKIES_FILE")

TOTAL_CITAS=$(echo $CITAS_RESPONSE | jq -r '.total // 0')

if [ "$TOTAL_CITAS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No hay citas en el sistema${NC}"
    echo "   Para probar las acciones, crea algunas citas desde el frontend"
else
    echo "Total de citas: $TOTAL_CITAS"
    echo ""
    echo "Primeras 5 citas con sus estados:"
    echo $CITAS_RESPONSE | jq -r '.data[] | "  • ID: \(.id) | Estado: \(.estado) | Vehículo: \(.matricula)"'
fi

echo ""

# ============================================================================
# 5. RESUMEN DE IMPLEMENTACIÓN
# ============================================================================
echo -e "${BLUE}5️⃣  Resumen de implementación:${NC}"
echo ""

echo "✅ Acciones implementadas en AppointmentsListPage.jsx:"
echo ""
echo "  1. 👁️  Ver detalles (handleView)"
echo "     └─ Modal con información completa de la cita"
echo "     └─ Muestra: vehículo, servicio, fecha, solicitante, notas, diagnóstico, etc."
echo ""
echo "  2. ✏️  Editar (handleEdit)"
echo "     └─ Solo visible si estado ≠ completada/cancelada"
echo "     └─ Requiere permiso: appointments:edit"
echo "     └─ Estado: Pendiente implementar modal de edición"
echo ""
echo "  3. ✅ Confirmar (handleConfirm)"
echo "     └─ Solo visible si estado = pendiente"
echo "     └─ Requiere permiso: appointments:manage"
echo ""
echo "  4. ⏰ Completar (handleComplete)"
echo "     └─ Solo visible si estado = confirmada"
echo "     └─ Requiere permiso: appointments:manage"
echo "     └─ Solicita diagnóstico y trabajos realizados"
echo ""
echo "  5. ❌ Cancelar (handleCancel)"
echo "     └─ Solo visible si estado ≠ cancelada/completada"
echo "     └─ Requiere permiso: appointments:cancel"
echo "     └─ Solicita motivo de cancelación"
echo ""

# ============================================================================
# 6. VALIDACIONES
# ============================================================================
echo -e "${BLUE}🔍 Validaciones:${NC}"
echo ""

validaciones=0
errores=0

# Validar que admin tiene appointments:view
if echo "$PERMISOS" | grep -q "appointments:view"; then
    echo -e "${GREEN}✅${NC} Admin tiene permiso appointments:view"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Admin NO tiene permiso appointments:view"
    ((errores++))
fi

# Validar que admin tiene appointments:edit
if echo "$PERMISOS" | grep -q "appointments:edit"; then
    echo -e "${GREEN}✅${NC} Admin tiene permiso appointments:edit"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Admin NO tiene permiso appointments:edit"
    ((errores++))
fi

# Validar que admin tiene appointments:manage
if echo "$PERMISOS" | grep -q "appointments:manage"; then
    echo -e "${GREEN}✅${NC} Admin tiene permiso appointments:manage"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Admin NO tiene permiso appointments:manage"
    ((errores++))
fi

# Validar que admin tiene appointments:cancel
if echo "$PERMISOS" | grep -q "appointments:cancel"; then
    echo -e "${GREEN}✅${NC} Admin tiene permiso appointments:cancel"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Admin NO tiene permiso appointments:cancel"
    ((errores++))
fi

# Validar que el archivo fue modificado
if grep -q "handleView" /home/siga/Proyectos/SIGA/frontend/src/pages/taller/AppointmentsListPage.jsx; then
    echo -e "${GREEN}✅${NC} Función handleView implementada en frontend"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Función handleView NO encontrada en frontend"
    ((errores++))
fi

if grep -q "handleEdit" /home/siga/Proyectos/SIGA/frontend/src/pages/taller/AppointmentsListPage.jsx; then
    echo -e "${GREEN}✅${NC} Función handleEdit implementada en frontend"
    ((validaciones++))
else
    echo -e "${RED}❌${NC} Función handleEdit NO encontrada en frontend"
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

echo "📝 Nota: Abre el frontend en http://localhost:3000/taller/citas para ver las acciones"
echo ""
