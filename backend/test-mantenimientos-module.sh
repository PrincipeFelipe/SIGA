#!/bin/bash

# ============================================================================
# TEST MÓDULO DE MANTENIMIENTOS - Script de pruebas completo
# ============================================================================

BASE_URL="http://localhost:5000"
COOKIE_FILE="$(dirname "$0")/cookies-mant.txt"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ============================================================================
# 1. LOGIN
# ============================================================================

print_header "1. Autenticación"

echo "Iniciando sesión como admin..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_usuario": "admin",
    "password": "Admin123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "Login exitoso"; then
    print_success "Login exitoso"
else
    print_error "Error en login"
    echo "$LOGIN_RESPONSE" | jq '.'
    exit 1
fi

# ============================================================================
# 2. TIPOS DE MANTENIMIENTO
# ============================================================================

print_header "2. Tipos de Mantenimiento"

echo "Obteniendo tipos de mantenimiento..."
TIPOS_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/tipos-mantenimiento")

TIPOS_COUNT=$(echo "$TIPOS_RESPONSE" | jq '.data | length')
print_success "Total de tipos: $TIPOS_COUNT"

echo "Mostrando primeros 5 tipos:"
echo "$TIPOS_RESPONSE" | jq '.data[:5] | .[] | {id, nombre, categoria, prioridad, frecuencia_km, frecuencia_meses}'

echo ""
echo "Obteniendo solo tipos activos..."
TIPOS_ACTIVOS=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/tipos-mantenimiento/activos")
ACTIVOS_COUNT=$(echo "$TIPOS_ACTIVOS" | jq '.data | length')
print_success "Tipos activos: $ACTIVOS_COUNT"

# ============================================================================
# 3. ESTADÍSTICAS DE MANTENIMIENTOS
# ============================================================================

print_header "3. Estadísticas de Mantenimientos"

echo "Obteniendo estadísticas..."
STATS_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/mantenimientos/estadisticas")

echo "$STATS_RESPONSE" | jq '.'

# ============================================================================
# 4. MANTENIMIENTOS PENDIENTES
# ============================================================================

print_header "4. Mantenimientos Pendientes"

echo "Obteniendo mantenimientos pendientes..."
PENDIENTES_RESPONSE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/mantenimientos/pendientes")

PENDIENTES_TOTAL=$(echo "$PENDIENTES_RESPONSE" | jq '.data | length')
print_success "Total pendientes: $PENDIENTES_TOTAL"

if [ "$PENDIENTES_TOTAL" -gt 0 ]; then
    echo ""
    echo "Mostrando mantenimientos pendientes:"
    echo "$PENDIENTES_RESPONSE" | jq '.data[] | {
        vehiculo: .vehiculo_matricula,
        tipo: .tipo_mantenimiento,
        estado: .estado,
        prioridad: .prioridad,
        dias_restantes: .dias_restantes,
        km_restantes: .km_restantes
    }'
fi

echo ""
echo "Filtrando solo vencidos..."
VENCIDOS=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/mantenimientos/pendientes?estado=vencido")
VENCIDOS_COUNT=$(echo "$VENCIDOS" | jq '.data | length')
print_error "Mantenimientos vencidos: $VENCIDOS_COUNT"

echo ""
echo "Filtrando solo próximos..."
PROXIMOS=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/mantenimientos/pendientes?estado=proximo")
PROXIMOS_COUNT=$(echo "$PROXIMOS" | jq '.data | length')
print_info "Próximos a vencer: $PROXIMOS_COUNT"

# ============================================================================
# 5. CREAR TIPO DE MANTENIMIENTO
# ============================================================================

print_header "5. Crear Tipo de Mantenimiento"

echo "Creando nuevo tipo de mantenimiento de prueba..."
CREATE_TYPE_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/tipos-mantenimiento" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mantenimiento de Prueba - Script",
    "descripcion": "Tipo creado por script de pruebas",
    "categoria": "general",
    "prioridad": "normal",
    "frecuencia_km": 50000,
    "frecuencia_meses": 24,
    "margen_km_aviso": 2000,
    "margen_dias_aviso": 60,
    "costo_estimado": 150.00,
    "activo": true
  }')

if echo "$CREATE_TYPE_RESPONSE" | grep -q '"success":true'; then
    TIPO_ID=$(echo "$CREATE_TYPE_RESPONSE" | jq '.data.id')
    print_success "Tipo creado con ID: $TIPO_ID"
else
    print_error "Error al crear tipo"
    echo "$CREATE_TYPE_RESPONSE" | jq '.'
fi

# ============================================================================
# 6. OBTENER VEHÍCULOS
# ============================================================================

print_header "6. Vehículos Disponibles"

echo "Obteniendo lista de vehículos..."
VEHICULOS=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/vehiculos")
VEHICULOS_COUNT=$(echo "$VEHICULOS" | jq '.data | length')
print_success "Total vehículos: $VEHICULOS_COUNT"

if [ "$VEHICULOS_COUNT" -gt 0 ]; then
    PRIMER_VEHICULO_ID=$(echo "$VEHICULOS" | jq -r '.data[0].id')
    PRIMER_VEHICULO_MATRICULA=$(echo "$VEHICULOS" | jq -r '.data[0].matricula')
    print_info "Usando vehículo: $PRIMER_VEHICULO_MATRICULA (ID: $PRIMER_VEHICULO_ID)"
    
    # ========================================================================
    # 7. CREAR MANTENIMIENTO
    # ========================================================================
    
    print_header "7. Registrar Mantenimiento"
    
    echo "Registrando mantenimiento para vehículo $PRIMER_VEHICULO_MATRICULA..."
    
    # Obtener el ID del primer tipo de mantenimiento
    PRIMER_TIPO_ID=$(echo "$TIPOS_RESPONSE" | jq -r '.data[0].id')
    
    CREATE_MANT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$BASE_URL/api/mantenimientos" \
      -H "Content-Type: application/json" \
      -d "{
        \"vehiculo_id\": $PRIMER_VEHICULO_ID,
        \"tipo_mantenimiento_id\": $PRIMER_TIPO_ID,
        \"fecha_realizado\": \"$(date +%Y-%m-%d)\",
        \"kilometraje_realizado\": 45000,
        \"costo_realizado\": 89.50,
        \"numero_factura\": \"TEST-$(date +%Y%m%d)\",
        \"observaciones\": \"Mantenimiento creado por script de pruebas\"
      }")
    
    if echo "$CREATE_MANT_RESPONSE" | grep -q '"success":true'; then
        MANT_ID=$(echo "$CREATE_MANT_RESPONSE" | jq '.data.id')
        print_success "Mantenimiento registrado con ID: $MANT_ID"
        
        # Mostrar próximo mantenimiento calculado
        echo ""
        echo "Próximo mantenimiento calculado automáticamente:"
        echo "$CREATE_MANT_RESPONSE" | jq '{
            proximo_kilometraje: .data.proximo_kilometraje,
            proxima_fecha: .data.proxima_fecha
        }'
        
        # ====================================================================
        # 8. OBTENER DETALLE DEL MANTENIMIENTO
        # ====================================================================
        
        print_header "8. Consultar Mantenimiento"
        
        echo "Obteniendo detalle del mantenimiento $MANT_ID..."
        DETALLE=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/mantenimientos/$MANT_ID")
        
        echo "$DETALLE" | jq '.data'
        
        # ====================================================================
        # 9. HISTORIAL POR VEHÍCULO
        # ====================================================================
        
        print_header "9. Historial del Vehículo"
        
        echo "Obteniendo historial de mantenimientos para vehículo $PRIMER_VEHICULO_MATRICULA..."
        HISTORIAL=$(curl -s -b "$COOKIE_FILE" "$BASE_URL/api/mantenimientos/vehiculo/$PRIMER_VEHICULO_ID")
        
        HISTORIAL_COUNT=$(echo "$HISTORIAL" | jq '.data | length')
        print_success "Total mantenimientos realizados: $HISTORIAL_COUNT"
        
        if [ "$HISTORIAL_COUNT" -gt 0 ]; then
            echo ""
            echo "Historial completo:"
            echo "$HISTORIAL" | jq '.data[] | {
                fecha: .fecha_realizado,
                tipo: .tipo_mantenimiento,
                km: .kilometraje_realizado,
                costo: .costo_realizado,
                proximo_km: .proximo_kilometraje,
                proxima_fecha: .proxima_fecha
            }'
        fi
        
        # ====================================================================
        # 10. LIMPIAR - ELIMINAR REGISTROS DE PRUEBA
        # ====================================================================
        
        print_header "10. Limpieza"
        
        echo "¿Desea eliminar los registros de prueba? (s/N): "
        read -t 10 -n 1 CLEANUP
        echo ""
        
        if [ "$CLEANUP" = "s" ] || [ "$CLEANUP" = "S" ]; then
            echo "Eliminando mantenimiento de prueba..."
            DELETE_MANT=$(curl -s -b "$COOKIE_FILE" -X DELETE "$BASE_URL/api/mantenimientos/$MANT_ID")
            
            if echo "$DELETE_MANT" | grep -q '"success":true'; then
                print_success "Mantenimiento eliminado"
            else
                print_error "Error al eliminar mantenimiento"
            fi
            
            if [ -n "$TIPO_ID" ]; then
                echo "Eliminando tipo de mantenimiento de prueba..."
                DELETE_TYPE=$(curl -s -b "$COOKIE_FILE" -X DELETE "$BASE_URL/api/tipos-mantenimiento/$TIPO_ID")
                
                if echo "$DELETE_TYPE" | grep -q '"success":true'; then
                    print_success "Tipo eliminado"
                else
                    print_error "Error al eliminar tipo"
                fi
            fi
        else
            print_info "Registros de prueba conservados"
        fi
    else
        print_error "Error al crear mantenimiento"
        echo "$CREATE_MANT_RESPONSE" | jq '.'
    fi
else
    print_error "No hay vehículos disponibles para pruebas"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================

print_header "RESUMEN DE PRUEBAS"

echo ""
echo "📊 Estadísticas del Módulo:"
echo "  • Tipos de mantenimiento: $TIPOS_COUNT"
echo "  • Tipos activos: $ACTIVOS_COUNT"
echo "  • Mantenimientos pendientes: $PENDIENTES_TOTAL"
echo "  • Mantenimientos vencidos: $VENCIDOS_COUNT"
echo "  • Próximos a vencer: $PROXIMOS_COUNT"
echo "  • Vehículos disponibles: $VEHICULOS_COUNT"
echo ""
echo -e "${GREEN}✅ Pruebas completadas${NC}"

# Limpiar cookie file
rm -f "$COOKIE_FILE"
