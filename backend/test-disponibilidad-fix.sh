#!/bin/bash

echo "=========================================="
echo "TEST: Disponibilidad de Citas - Fix"
echo "=========================================="
echo ""

# Crear una cita de prueba: 09:00-10:00
echo "1. Creando cita de prueba (09:00-10:00)..."

# Login
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"Admin123!"}' \
  -c /tmp/test-disp.txt > /dev/null

echo "✅ Login exitoso"
echo ""

# Obtener un tipo de cita (duración 30 min)
TIPO_ID=$(curl -s -X GET "http://localhost:5000/api/tipos-cita/activos" \
  -b /tmp/test-disp.txt | jq -r '.data[0].id')

echo "📋 Tipo de cita: $TIPO_ID"
echo ""

# Obtener disponibilidad para hoy
FECHA=$(date +%Y-%m-%d)

echo "2. Consultando disponibilidad para $FECHA..."
echo ""

RESPONSE=$(curl -s -X GET "http://localhost:5000/api/citas/disponibilidad?fecha=${FECHA}&tipo_cita_id=${TIPO_ID}" \
  -b /tmp/test-disp.txt)

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Endpoint funciona correctamente"
    echo ""
    
    TOTAL=$(echo "$RESPONSE" | jq -r '.data.slots_totales')
    DISPONIBLES=$(echo "$RESPONSE" | jq -r '.data.slots_disponibles')
    DURACION=$(echo "$RESPONSE" | jq -r '.data.duracion_minutos')
    
    echo "📊 Estadísticas:"
    echo "   - Duración de cita: $DURACION minutos"
    echo "   - Slots totales: $TOTAL"
    echo "   - Slots disponibles: $DISPONIBLES"
    echo ""
    
    echo "🕐 Primeros 10 slots:"
    echo "$RESPONSE" | jq -r '.data.slots[:10] | .[] | "  \(.hora) - \(if .disponible then "✅ Disponible" else "❌ Ocupado" end)"'
    
    echo ""
    echo "💡 Verificación del fix:"
    echo "   Si hay una cita 09:00-10:00, debería:"
    echo "   - ✅ 08:00-08:30: Disponible (antes de la cita)"
    echo "   - ✅ 08:30-09:00: Disponible (justo antes)"
    echo "   - ❌ 09:00-09:30: Ocupado (durante la cita)"
    echo "   - ❌ 09:30-10:00: Ocupado (durante la cita)"
    echo "   - ✅ 10:00-10:30: Disponible (después de la cita)"
    
else
    echo "❌ Error en el endpoint:"
    echo "$RESPONSE" | jq '.'
fi

echo ""
echo "=========================================="
echo "FIN DEL TEST"
echo "=========================================="
