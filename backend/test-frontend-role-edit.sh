#!/bin/bash

echo "🧪 Simulación de edición de rol desde frontend"
echo "==============================================="

# Login
echo "1. Iniciando sesión..."
curl -s -c cookies-test.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' > /dev/null

# Obtener rol de ejemplo (Jefe de Zona)
echo "2. Obteniendo rol 'Jefe de Zona'..."
ROL=$(curl -s -b cookies-test.txt http://localhost:5000/api/roles/2)
echo "$ROL" | jq '{id: .data.id, nombre: .data.nombre, descripcion: .data.descripcion}'

# Obtener permisos actuales del rol
echo -e "\n3. Permisos actuales del rol..."
PERMISOS_ACTUALES=$(curl -s -b cookies-test.txt http://localhost:5000/api/roles/2/permisos)
echo "$PERMISOS_ACTUALES" | jq '.data.permisos | length as $count | "Total permisos: \($count)"'

# Actualizar descripción del rol
echo -e "\n4. Actualizando descripción del rol..."
UPDATE_RESPONSE=$(curl -s -b cookies-test.txt -X PUT http://localhost:5000/api/roles/2 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Jefe de Zona","descripcion":"Rol actualizado desde test - Gestiona zona regional"}')

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✓ Rol actualizado correctamente"
else
    echo "✗ Error al actualizar rol"
    echo "$UPDATE_RESPONSE" | jq '.'
fi

# Seleccionar 10 permisos para asignar
echo -e "\n5. Asignando nuevos permisos al rol (10 permisos)..."
NUEVOS_PERMISOS=$(curl -s -b cookies-test.txt http://localhost:5000/api/permisos | jq '[.data[0:10] | .[].id]')
echo "Permisos a asignar: $NUEVOS_PERMISOS"

ASIGNAR_RESPONSE=$(curl -s -b cookies-test.txt -X POST http://localhost:5000/api/roles/2/permisos \
  -H "Content-Type: application/json" \
  -d "{\"permisos\": $NUEVOS_PERMISOS}")

if echo "$ASIGNAR_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✓ Permisos asignados correctamente"
    echo "$ASIGNAR_RESPONSE" | jq '.data.permisos | length as $count | "Total permisos asignados: \($count)"'
else
    echo "✗ Error al asignar permisos"
    echo "$ASIGNAR_RESPONSE" | jq '.'
fi

# Verificar permisos finales
echo -e "\n6. Verificando permisos finales del rol..."
PERMISOS_FINALES=$(curl -s -b cookies-test.txt http://localhost:5000/api/roles/2/permisos)
echo "$PERMISOS_FINALES" | jq '.data.permisos | .[] | .accion' | head -10

echo -e "\n✓ Test completado"
rm -f cookies-test.txt
