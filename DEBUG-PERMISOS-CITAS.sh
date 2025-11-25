#!/bin/bash

# ============================================================================
# DEBUG: Verificar permisos en consola del navegador
# ============================================================================

echo "════════════════════════════════════════════════════════════════════════"
echo "  DEBUG: Verificación de Permisos de Citas"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 INSTRUCCIONES PARA DEBUG EN NAVEGADOR:"
echo ""
echo "1. Abre Chrome DevTools (F12)"
echo "2. Ve a la pestaña 'Console'"
echo "3. Pega el siguiente código:"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
cat << 'EOF'

// Verificar usuario actual y permisos
const authData = JSON.parse(localStorage.getItem('user') || '{}');
console.log('👤 Usuario:', authData.username);
console.log('📝 Total permisos:', authData.permisos?.length || 0);
console.log('🎫 Permisos de citas:', authData.permisos?.filter(p => p.startsWith('appointments:')) || []);

// Verificar permisos específicos
const permisos = {
    view: authData.permisos?.includes('appointments:view'),
    create: authData.permisos?.includes('appointments:create'),
    edit: authData.permisos?.includes('appointments:edit'),
    manage: authData.permisos?.includes('appointments:manage'),
    cancel: authData.permisos?.includes('appointments:cancel')
};

console.table(permisos);

// Si algún permiso es false, el problema está en el backend o la carga del usuario
if (!permisos.edit || !permisos.manage || !permisos.cancel) {
    console.warn('⚠️ PROBLEMA: Faltan permisos en el objeto user del localStorage');
    console.log('💡 Solución: Intenta cerrar sesión y volver a iniciar sesión');
} else {
    console.log('✅ Todos los permisos están correctos en localStorage');
    console.log('🔍 Verifica que el componente esté usando usePermissions correctamente');
}

EOF
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "4. Presiona Enter para ejecutar"
echo "5. Revisa el output en la consola"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 VERIFICACIÓN DESDE BACKEND:"
echo ""

# Login y verificar permisos desde el backend
curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -c "/tmp/debug-cookies.txt" \
  -d '{"username": "admin", "password": "Admin123!"}' > /dev/null

PERMISOS=$(curl -s "http://localhost:5000/api/auth/me" -b "/tmp/debug-cookies.txt" | jq -r '.user.permisos[] | select(startswith("appointments:"))')

echo "Permisos de appointments: del backend:"
echo "$PERMISOS" | while read p; do
    echo "  ✓ $p"
done

TOTAL=$(echo "$PERMISOS" | wc -l)
echo ""
echo "Total: $TOTAL permisos de citas"

if [ $TOTAL -ge 5 ]; then
    echo "✅ Backend devuelve todos los permisos correctamente"
else
    echo "❌ Backend NO devuelve todos los permisos"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 POSIBLES CAUSAS DEL PROBLEMA:"
echo ""
echo "1. El usuario no cerró sesión después de cambios en permisos"
echo "   Solución: Logout → Login"
echo ""
echo "2. Los permisos en localStorage están desactualizados"
echo "   Solución: Clear localStorage → Login"
echo ""
echo "3. El componente no está recibiendo los permisos del contexto"
echo "   Solución: Verificar AuthContext.js y usePermissions.js"
echo ""
echo "4. Los botones están condicionados incorrectamente"
echo "   Solución: Revisar AppointmentsListPage.jsx líneas 490-550"
echo ""
echo "════════════════════════════════════════════════════════════════════════"

rm -f /tmp/debug-cookies.txt
