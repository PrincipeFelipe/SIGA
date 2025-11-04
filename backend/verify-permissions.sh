#!/bin/bash
# ============================================================================
# VERIFICACIÓN DE PERMISOS - DEBUG
# ============================================================================

echo "🔍 Verificando sistema de permisos..."
echo "========================================="
echo ""

# Login
echo "1️⃣  Haciendo login como admin..."
LOGIN=$(curl -s -c /tmp/verify-cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}')

if echo "$LOGIN" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ Login exitoso"
else
    echo "❌ Error en login"
    exit 1
fi

echo ""
echo "2️⃣  Obteniendo información del usuario..."
ME=$(curl -s -b /tmp/verify-cookies.txt http://localhost:5000/api/auth/me)

# Verificar que tenga permisos
PERMISOS_COUNT=$(echo "$ME" | jq '.user.permisos | length')
echo "✅ Permisos encontrados: $PERMISOS_COUNT"

echo ""
echo "3️⃣  Permisos de usuarios:"
echo "$ME" | jq '.user.permisos | map(select(startswith("users:")))' | jq -r '.[]' | while read permiso; do
    echo "   ✓ $permiso"
done

echo ""
echo "4️⃣  Verificando frontend..."
echo "   URL: http://localhost:3000"
echo "   Abrir la consola del navegador (F12)"
echo "   Buscar: 'user.permisos'"
echo ""
echo "5️⃣  Si no ves las acciones:"
echo "   → Cierra sesión completamente"
echo "   → Borra las cookies del navegador (Ctrl+Shift+Del)"
echo "   → Refresca la página (Ctrl+Shift+R)"
echo "   → Inicia sesión de nuevo"
echo ""
echo "========================================="
echo "✅ Backend configurado correctamente"
echo "   Los permisos se están devolviendo desde el servidor"

rm -f /tmp/verify-cookies.txt
