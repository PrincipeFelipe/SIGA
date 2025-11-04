#!/bin/bash

echo "🧪 Test de permisos de usuario R84101K"
echo "======================================="

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Login como R84101K
echo -e "\n${YELLOW}1. Iniciando sesión como R84101K...${NC}"
curl -s -c cookies-r84-test.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"R84101K","password":"klandemo"}' > /dev/null

# Obtener info del usuario
echo -e "\n${BLUE}2. Información del usuario:${NC}"
USER_INFO=$(curl -s -b cookies-r84-test.txt http://localhost:5000/api/auth/me)
echo "$USER_INFO" | jq -r '.user | {username, nombre, roles, total_permisos: (.permisos | length)}'

# Mostrar permisos
echo -e "\n${BLUE}3. Permisos del usuario:${NC}"
echo "$USER_INFO" | jq -r '.user.permisos[]' | while read permiso; do
    echo "  ✓ $permiso"
done

# Verificar permisos específicos
echo -e "\n${BLUE}4. Verificación de permisos de usuarios:${NC}"
HAS_VIEW=$(echo "$USER_INFO" | jq -r '.user.permisos | any(. == "users:view")')
HAS_VIEW_DETAIL=$(echo "$USER_INFO" | jq -r '.user.permisos | any(. == "users:view_detail")')
HAS_RESET_PASSWORD=$(echo "$USER_INFO" | jq -r '.user.permisos | any(. == "users:reset_password")')
HAS_EDIT=$(echo "$USER_INFO" | jq -r '.user.permisos | any(. == "users:edit")')
HAS_DELETE=$(echo "$USER_INFO" | jq -r '.user.permisos | any(. == "users:delete")')

echo "  users:view           : $([ "$HAS_VIEW" == "true" ] && echo "✓ Sí" || echo "✗ No")"
echo "  users:view_detail    : $([ "$HAS_VIEW_DETAIL" == "true" ] && echo "✓ Sí" || echo "✗ No")"
echo "  users:reset_password : $([ "$HAS_RESET_PASSWORD" == "true" ] && echo "✓ Sí" || echo "✗ No")"
echo "  users:edit           : $([ "$HAS_EDIT" == "true" ] && echo "✓ Sí" || echo "✗ No")"
echo "  users:delete         : $([ "$HAS_DELETE" == "true" ] && echo "✓ Sí" || echo "✗ No")"

# Simular carga de usuarios
echo -e "\n${BLUE}5. Listado de usuarios visibles:${NC}"
USERS=$(curl -s -b cookies-r84-test.txt http://localhost:5000/api/usuarios)
USERS_COUNT=$(echo "$USERS" | jq -r '.data | length')
echo "  Total usuarios visibles: $USERS_COUNT"
echo "$USERS" | jq -r '.data[] | "  - \(.username) (\(.nombre_completo))"'

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}Acciones esperadas en el frontend:${NC}"
echo -e "${GREEN}=======================================${NC}"
echo "  ✓ Ver detalle (ícono ojo azul)"
echo "  ✓ Restablecer contraseña (ícono llave naranja)"
echo ""
echo "  ✗ NO debe ver: Editar, Gestionar roles, Eliminar"
echo -e "${GREEN}=======================================${NC}"

rm -f cookies-r84-test.txt
