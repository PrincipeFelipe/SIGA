#!/bin/bash

echo "========================================"
echo "TEST: Tipos de Cita - Fix Ambigüedad"
echo "========================================"
echo ""

# Verificar estructura en BD
echo "1. Verificando datos en BD..."
mysql -u root -pklandemo siga_db -e "SELECT id, nombre, duracion_minutos, activo FROM TiposCita LIMIT 5;" 2>&1 | grep -v "mysql: \[Warning\]"
echo ""

# Login
echo "2. Login como admin..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"Admin123!"}' \
  -c /tmp/test-tipos.txt > /dev/null

echo "✅ Login exitoso"
echo ""

# Test endpoint activos
echo "3. Probando GET /api/tipos-cita?activo=true..."
RESPONSE=$(curl -s -X GET "http://localhost:5000/api/tipos-cita?activo=true" \
  -b /tmp/test-tipos.txt)

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq -r '.data | length')
    echo "✅ Endpoint funciona correctamente"
    echo "📊 Tipos de cita activos: $COUNT"
    echo ""
    echo "Primeros 3 tipos:"
    echo "$RESPONSE" | jq -r '.data[0:3] | .[] | "  - \(.nombre) (\(.duracion_minutos) min)"'
else
    echo "❌ Error en el endpoint:"
    echo "$RESPONSE" | jq '.'
fi

echo ""
echo "========================================"
echo "FIN DEL TEST"
echo "========================================"
