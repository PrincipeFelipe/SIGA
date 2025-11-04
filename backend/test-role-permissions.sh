#!/bin/bash

echo "🧪 Test de asignación de permisos a roles"
echo "=========================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Obtener cookie de autenticación
echo -e "\n${YELLOW}1. Iniciando sesión como admin...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}')

if echo "$LOGIN_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✓ Login exitoso${NC}"
else
    echo -e "${RED}✗ Error en login${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
    exit 1
fi

# Obtener lista de roles
echo -e "\n${YELLOW}2. Obteniendo lista de roles...${NC}"
ROLES=$(curl -s -b cookies.txt http://localhost:5000/api/roles)
PRIMER_ROL_ID=$(echo "$ROLES" | jq -r '.data[0].id')
PRIMER_ROL_NOMBRE=$(echo "$ROLES" | jq -r '.data[0].nombre')

echo -e "${GREEN}✓ Rol seleccionado: ${PRIMER_ROL_NOMBRE} (ID: ${PRIMER_ROL_ID})${NC}"

# Obtener permisos disponibles
echo -e "\n${YELLOW}3. Obteniendo permisos disponibles...${NC}"
PERMISOS=$(curl -s -b cookies.txt http://localhost:5000/api/permisos)
PERMISOS_IDS=$(echo "$PERMISOS" | jq -r '.data[0:5] | map(.id)')

echo -e "${GREEN}✓ Se asignarán los primeros 5 permisos${NC}"
echo "$PERMISOS" | jq -r '.data[0:5] | .[] | "  - \(.id): \(.accion) - \(.descripcion)"'

# Test 1: Asignar permisos (formato correcto)
echo -e "\n${YELLOW}4. Test: Asignar permisos al rol...${NC}"
ASIGNAR_RESPONSE=$(curl -s -b cookies.txt -X POST \
  http://localhost:5000/api/roles/${PRIMER_ROL_ID}/permisos \
  -H "Content-Type: application/json" \
  -d "{\"permisos\": ${PERMISOS_IDS}}")

if echo "$ASIGNAR_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✓ Permisos asignados correctamente${NC}"
    echo "$ASIGNAR_RESPONSE" | jq -r '.data.permisos | length as $count | "  Total asignados: \($count)"'
else
    echo -e "${RED}✗ Error al asignar permisos${NC}"
    echo "$ASIGNAR_RESPONSE" | jq '.'
    exit 1
fi

# Verificar permisos asignados
echo -e "\n${YELLOW}5. Verificando permisos del rol...${NC}"
PERMISOS_ROL=$(curl -s -b cookies.txt http://localhost:5000/api/roles/${PRIMER_ROL_ID}/permisos)

if echo "$PERMISOS_ROL" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✓ Permisos del rol cargados correctamente${NC}"
    echo "$PERMISOS_ROL" | jq -r '.data.permisos | .[] | "  ✓ \(.accion)"'
else
    echo -e "${RED}✗ Error al obtener permisos del rol${NC}"
    echo "$PERMISOS_ROL" | jq '.'
fi

# Test 2: Actualizar rol con permisos (formato frontend)
echo -e "\n${YELLOW}6. Test: Actualizar nombre del rol...${NC}"
ACTUALIZAR_RESPONSE=$(curl -s -b cookies.txt -X PUT \
  http://localhost:5000/api/roles/${PRIMER_ROL_ID} \
  -H "Content-Type: application/json" \
  -d "{\"nombre\": \"${PRIMER_ROL_NOMBRE}\", \"descripcion\": \"Rol de prueba actualizado\"}")

if echo "$ACTUALIZAR_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✓ Rol actualizado correctamente${NC}"
else
    echo -e "${RED}✗ Error al actualizar rol${NC}"
    echo "$ACTUALIZAR_RESPONSE" | jq '.'
fi

echo -e "\n${GREEN}=========================================="
echo "✓ Todos los tests pasaron correctamente"
echo -e "==========================================${NC}"

# Limpiar cookies
rm -f cookies.txt
