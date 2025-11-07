#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBA - FILTRADO JERÁRQUICO DE TAREAS
# ============================================================================
# Verifica que los usuarios vean tareas según su alcance jerárquico
# ============================================================================

BASE_URL="http://localhost:5000"
COLOR_RESET="\033[0m"
COLOR_GREEN="\033[0;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_BLUE="\033[0;34m"
COLOR_RED="\033[0;31m"

echo -e "${COLOR_BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   PRUEBA DE FILTRADO JERÁRQUICO DE TAREAS                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${COLOR_RESET}"

# Paso 1: Verificar estructura de usuarios y unidades
echo -e "\n${COLOR_YELLOW}📊 PASO 1: Verificar estructura de usuarios y unidades${COLOR_RESET}"
echo "================================================================"

mysql -u root -pklandemo siga_db -e "
SELECT 
    u.id,
    u.username,
    u.nombre_completo,
    un.id as unidad_id,
    un.nombre as unidad,
    un.tipo_unidad
FROM Usuarios u
LEFT JOIN Unidades un ON u.unidad_destino_id = un.id
WHERE u.username IN ('admin', 'R84101K', 'jefe.zona.norte', 'coord.huesca')
ORDER BY u.id;
" 2>/dev/null

# Paso 2: Verificar tareas existentes
echo -e "\n${COLOR_YELLOW}📋 PASO 2: Tareas existentes en el sistema${COLOR_RESET}"
echo "================================================================"

mysql -u root -pklandemo siga_db -e "
SELECT 
    t.id,
    t.titulo,
    t.es_241,
    ua.username as asignado_a,
    ua_un.nombre as unidad_asignado,
    up.username as asignado_por
FROM Tareas t
INNER JOIN Usuarios ua ON t.asignado_a = ua.id
INNER JOIN Usuarios up ON t.asignado_por = up.id
LEFT JOIN Unidades ua_un ON ua.unidad_destino_id = ua_un.id
ORDER BY t.id;
" 2>/dev/null

# Paso 3: Login como admin
echo -e "\n${COLOR_YELLOW}🔐 PASO 3: Login como admin${COLOR_RESET}"
echo "================================================================"

curl -s -c /tmp/cookies-admin.txt \
  -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' | jq -r '.message'

# Paso 4: Verificar alcance de admin
echo -e "\n${COLOR_YELLOW}🎯 PASO 4: Alcance del usuario admin${COLOR_RESET}"
echo "================================================================"

mysql -u root -pklandemo siga_db -e "
SELECT DISTINCT
    un.id,
    un.nombre,
    un.tipo_unidad
FROM Usuario_Roles_Alcance ura
INNER JOIN Roles r ON ura.rol_id = r.id
INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
WHERE ura.usuario_id = (SELECT id FROM Usuarios WHERE username = 'admin')
  AND ura.activo = TRUE
ORDER BY un.id;
" 2>/dev/null

# Paso 5: Tareas visibles para admin
echo -e "\n${COLOR_YELLOW}👁️  PASO 5: Tareas visibles para admin${COLOR_RESET}"
echo "================================================================"

echo -e "${COLOR_GREEN}Resultado de la API:${COLOR_RESET}"
curl -s -b /tmp/cookies-admin.txt \
  "${BASE_URL}/api/tareas?page=1&limit=10" | jq '{
    total: (.data | length),
    tareas: [.data[] | {
      id,
      titulo,
      es_241,
      asignado_a: .asignado_a_username,
      asignado_por: .asignado_por_username
    }]
  }'

# Paso 6: Login como R84101K
echo -e "\n${COLOR_YELLOW}🔐 PASO 6: Login como R84101K${COLOR_RESET}"
echo "================================================================"

curl -s -c /tmp/cookies-r84.txt \
  -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"R84101K","password":"klandemo"}' | jq -r '.message'

# Paso 7: Verificar alcance de R84101K
echo -e "\n${COLOR_YELLOW}🎯 PASO 7: Alcance del usuario R84101K${COLOR_RESET}"
echo "================================================================"

mysql -u root -pklandemo siga_db -e "
SELECT DISTINCT
    un.id,
    un.nombre,
    un.tipo_unidad
FROM Usuario_Roles_Alcance ura
INNER JOIN Roles r ON ura.rol_id = r.id
INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
WHERE ura.usuario_id = (SELECT id FROM Usuarios WHERE username = 'R84101K')
  AND ura.activo = TRUE
ORDER BY un.id;
" 2>/dev/null

# Paso 8: Tareas visibles para R84101K
echo -e "\n${COLOR_YELLOW}👁️  PASO 8: Tareas visibles para R84101K${COLOR_RESET}"
echo "================================================================"

echo -e "${COLOR_GREEN}Resultado de la API:${COLOR_RESET}"
curl -s -b /tmp/cookies-r84.txt \
  "${BASE_URL}/api/tareas?page=1&limit=10" | jq '{
    total: (.data | length),
    tareas: [.data[] | {
      id,
      titulo,
      es_241,
      asignado_a: .asignado_a_username,
      asignado_por: .asignado_por_username
    }]
  }'

# Paso 9: Login como jefe.zona.norte
echo -e "\n${COLOR_YELLOW}🔐 PASO 9: Login como jefe.zona.norte${COLOR_RESET}"
echo "================================================================"

curl -s -c /tmp/cookies-jefe.txt \
  -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"jefe.zona.norte","password":"Password123!"}' | jq -r '.message'

# Paso 10: Verificar alcance de jefe.zona.norte
echo -e "\n${COLOR_YELLOW}🎯 PASO 10: Alcance del usuario jefe.zona.norte${COLOR_RESET}"
echo "================================================================"

mysql -u root -pklandemo siga_db -e "
SELECT DISTINCT
    un.id,
    un.nombre,
    un.tipo_unidad
FROM Usuario_Roles_Alcance ura
INNER JOIN Roles r ON ura.rol_id = r.id
INNER JOIN Unidades un ON ura.unidad_alcance_id = un.id
WHERE ura.usuario_id = (SELECT id FROM Usuarios WHERE username = 'jefe.zona.norte')
  AND ura.activo = TRUE
ORDER BY un.id;
" 2>/dev/null

# Paso 11: Tareas visibles para jefe.zona.norte
echo -e "\n${COLOR_YELLOW}👁️  PASO 11: Tareas visibles para jefe.zona.norte${COLOR_RESET}"
echo "================================================================"

echo -e "${COLOR_GREEN}Resultado de la API:${COLOR_RESET}"
curl -s -b /tmp/cookies-jefe.txt \
  "${BASE_URL}/api/tareas?page=1&limit=10" | jq '{
    total: (.data | length),
    tareas: [.data[] | {
      id,
      titulo,
      es_241,
      asignado_a: .asignado_a_username,
      asignado_por: .asignado_por_username
    }]
  }'

# Resumen
echo -e "\n${COLOR_BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅ PRUEBA COMPLETADA                                     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${COLOR_RESET}"

echo -e "\n${COLOR_GREEN}📝 Interpretación de resultados:${COLOR_RESET}"
echo "  • Admin: Debe ver TODAS las tareas (tiene tasks:view_all)"
echo "  • Jefe Zona Norte: Debe ver tareas de su zona jerárquica"
echo "  • R84101K: Solo debe ver tareas donde es asignado_a o asignado_por"
echo ""
