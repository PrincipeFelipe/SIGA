#!/bin/bash

# Test del menú dinámico con estructura jerárquica para Taller

echo "=========================================="
echo "TEST: Menú Dinámico con Submenús"
echo "=========================================="
echo ""

# Limpiar cookies anteriores
rm -f /tmp/cookies-menu.txt

# Login
echo "1. Login como admin..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"Admin123!"}' \
  -c /tmp/cookies-menu.txt)

echo "$RESPONSE" | jq -r '.message'
echo ""

# Obtener menú
echo "2. Obteniendo menú dinámico..."
MENU=$(curl -s -X GET http://localhost:5000/api/menu \
  -b /tmp/cookies-menu.txt)

echo "$MENU" | jq -r '.menu[] | "📂 \(.nombre) → \(.ruta)"'
echo ""

# Verificar estructura del item Taller
echo "3. Verificando estructura del menú 'Taller'..."
TALLER=$(echo "$MENU" | jq '.menu[] | select(.nombre == "Taller")')

if [ -z "$TALLER" ]; then
    echo "❌ No se encontró el menú 'Taller'"
else
    echo "✅ Menú 'Taller' encontrado"
    echo ""
    echo "📋 Detalles:"
    echo "$TALLER" | jq '{nombre, ruta, children: [.children[] | {nombre, ruta}]}'
fi

echo ""
echo "=========================================="
echo "FIN DEL TEST"
echo "=========================================="
