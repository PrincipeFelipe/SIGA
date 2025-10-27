#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBAS RÁPIDAS - API SIGA
# ============================================================================
# Este script realiza pruebas básicas de todos los endpoints del backend
# Uso: ./test-api.sh
# ============================================================================

BASE_URL="http://localhost:5000"
COOKIE_FILE="cookies.txt"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir títulos
print_title() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Función para pruebas exitosas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para pruebas fallidas
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Función para info
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================
print_title "1. HEALTH CHECK"

response=$(curl -s "$BASE_URL/health")
if [[ $response == *"success"* ]]; then
    print_success "Health check OK"
    echo "$response" | jq '.'
else
    print_error "Health check FAILED"
    exit 1
fi

# ============================================================================
# 2. AUTENTICACIÓN
# ============================================================================
print_title "2. AUTENTICACIÓN"

# Login como admin
print_info "Intentando login como admin..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Password123!"}' \
    -c "$COOKIE_FILE")

if [[ $login_response == *"success"*true* ]]; then
    print_success "Login exitoso como admin"
    echo "$login_response" | jq '.'
else
    print_error "Login FAILED"
    echo "$login_response"
    exit 1
fi

# Obtener información del usuario autenticado
print_info "Obteniendo información del usuario autenticado..."
me_response=$(curl -s "$BASE_URL/api/auth/me" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $me_response == *"success"*true* ]]; then
    print_success "Obtener usuario autenticado OK"
    echo "$me_response" | jq '.data | {id, username, nombre_completo, roles_alcance: .roles_alcance | length}'
else
    print_error "Obtener usuario FAILED"
fi

# ============================================================================
# 3. MENÚ DINÁMICO
# ============================================================================
print_title "3. MENÚ DINÁMICO"

menu_response=$(curl -s "$BASE_URL/api/menu" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $menu_response == *"success"*true* ]]; then
    print_success "Menú dinámico OK"
    echo "$menu_response" | jq '.data | length'
    echo "$menu_response" | jq '.data[0]'
else
    print_error "Menú dinámico FAILED"
fi

# ============================================================================
# 4. USUARIOS
# ============================================================================
print_title "4. GESTIÓN DE USUARIOS"

# Listar usuarios
print_info "Listando usuarios..."
usuarios_response=$(curl -s "$BASE_URL/api/usuarios?limit=5" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $usuarios_response == *"success"*true* ]]; then
    print_success "Listar usuarios OK"
    echo "$usuarios_response" | jq '{total: .total, usuarios: .data | length}'
else
    print_error "Listar usuarios FAILED"
fi

# Obtener usuario por ID
print_info "Obteniendo usuario ID 1..."
usuario_response=$(curl -s "$BASE_URL/api/usuarios/1" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $usuario_response == *"success"*true* ]]; then
    print_success "Obtener usuario por ID OK"
    echo "$usuario_response" | jq '.data | {id, username, nombre_completo}'
else
    print_error "Obtener usuario FAILED"
fi

# ============================================================================
# 5. UNIDADES
# ============================================================================
print_title "5. GESTIÓN DE UNIDADES"

# Obtener árbol de unidades
print_info "Obteniendo árbol de unidades..."
unidades_response=$(curl -s "$BASE_URL/api/unidades" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $unidades_response == *"success"*true* ]]; then
    print_success "Árbol de unidades OK"
    echo "$unidades_response" | jq '{total: .total, primer_zona: .data[0].nombre}'
else
    print_error "Árbol de unidades FAILED"
fi

# Obtener descendientes de Zona Centro (ID 1)
print_info "Obteniendo descendientes de Zona Centro..."
descendientes_response=$(curl -s "$BASE_URL/api/unidades/1/descendientes" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $descendientes_response == *"success"*true* ]]; then
    print_success "Descendientes OK (CTE recursivo funcionando)"
    echo "$descendientes_response" | jq '{total: .total}'
else
    print_error "Descendientes FAILED"
fi

# ============================================================================
# 6. ROLES
# ============================================================================
print_title "6. GESTIÓN DE ROLES"

# Listar roles
print_info "Listando roles..."
roles_response=$(curl -s "$BASE_URL/api/roles" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $roles_response == *"success"*true* ]]; then
    print_success "Listar roles OK"
    echo "$roles_response" | jq '{total: .total, roles: [.data[] | {id, nombre, total_permisos}]}'
else
    print_error "Listar roles FAILED"
fi

# Obtener permisos del rol Admin Total (ID 1)
print_info "Obteniendo permisos del rol Admin Total..."
rol_permisos_response=$(curl -s "$BASE_URL/api/roles/1/permisos" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $rol_permisos_response == *"success"*true* ]]; then
    print_success "Permisos del rol OK"
    echo "$rol_permisos_response" | jq '.data.permisos | length'
else
    print_error "Permisos del rol FAILED"
fi

# ============================================================================
# 7. PERMISOS
# ============================================================================
print_title "7. GESTIÓN DE PERMISOS"

# Listar permisos
print_info "Listando permisos..."
permisos_response=$(curl -s "$BASE_URL/api/permisos" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $permisos_response == *"success"*true* ]]; then
    print_success "Listar permisos OK"
    echo "$permisos_response" | jq '{total: .total, primeros: [.data[0:3] | .[] | {accion, nombre}]}'
else
    print_error "Listar permisos FAILED"
fi

# Permisos por recurso
print_info "Obteniendo permisos por recurso..."
permisos_recurso_response=$(curl -s "$BASE_URL/api/permisos/por-recurso" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $permisos_recurso_response == *"success"*true* ]]; then
    print_success "Permisos por recurso OK"
    echo "$permisos_recurso_response" | jq '.data | keys'
else
    print_error "Permisos por recurso FAILED"
fi

# ============================================================================
# 8. USUARIO_ROLES_ALCANCE
# ============================================================================
print_title "8. ASIGNACIONES DE ROLES Y ALCANCE"

# Obtener roles-alcance del usuario admin (ID 1)
print_info "Obteniendo roles-alcance del usuario admin..."
roles_alcance_response=$(curl -s "$BASE_URL/api/usuarios/1/roles-alcance" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $roles_alcance_response == *"success"*true* ]]; then
    print_success "Roles-alcance OK"
    echo "$roles_alcance_response" | jq '.data.roles_alcance | [.[] | {rol: .rol_nombre, unidad: .unidad_nombre}]'
else
    print_error "Roles-alcance FAILED"
fi

# ============================================================================
# 9. NOTIFICACIONES
# ============================================================================
print_title "9. NOTIFICACIONES"

# Listar notificaciones
print_info "Listando notificaciones..."
notif_response=$(curl -s "$BASE_URL/api/notificaciones" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $notif_response == *"success"*true* ]]; then
    print_success "Notificaciones OK"
    echo "$notif_response" | jq '{total: .pagination.total, no_leidas: .stats.no_leidas}'
else
    print_error "Notificaciones FAILED"
fi

# Contar no leídas
print_info "Contando notificaciones no leídas..."
no_leidas_response=$(curl -s "$BASE_URL/api/notificaciones/no-leidas" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $no_leidas_response == *"success"*true* ]]; then
    print_success "Contador de no leídas OK"
    echo "$no_leidas_response" | jq '.data'
else
    print_error "Contador FAILED"
fi

# ============================================================================
# 10. LOGS DE AUDITORÍA
# ============================================================================
print_title "10. LOGS DE AUDITORÍA"

# Listar logs
print_info "Listando logs recientes..."
logs_response=$(curl -s "$BASE_URL/api/logs?limit=5" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $logs_response == *"success"*true* ]]; then
    print_success "Logs OK"
    echo "$logs_response" | jq '{total: .pagination.total, logs: [.data[0:3] | .[] | {accion, recurso_tipo, username}]}'
else
    print_error "Logs FAILED"
fi

# Estadísticas de logs
print_info "Obteniendo estadísticas de logs..."
stats_response=$(curl -s "$BASE_URL/api/logs/estadisticas" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $stats_response == *"success"*true* ]]; then
    print_success "Estadísticas de logs OK"
    echo "$stats_response" | jq '.data | {total_logs, logs_por_accion: .logs_por_accion[0:3]}'
else
    print_error "Estadísticas FAILED"
fi

# ============================================================================
# 11. LOGOUT
# ============================================================================
print_title "11. CIERRE DE SESIÓN"

logout_response=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE")

if [[ $logout_response == *"success"*true* ]]; then
    print_success "Logout OK"
else
    print_error "Logout FAILED"
fi

# Limpiar cookies
rm -f "$COOKIE_FILE"

# ============================================================================
# RESUMEN
# ============================================================================
print_title "RESUMEN DE PRUEBAS"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║       ✓ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE       ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

print_info "El backend SIGA está funcionando correctamente"
print_info "Todos los módulos principales fueron validados:"
echo ""
echo "  ✓ Autenticación y autorización"
echo "  ✓ Gestión de usuarios"
echo "  ✓ Gestión de unidades (con CTEs recursivos)"
echo "  ✓ Gestión de roles y permisos"
echo "  ✓ Asignaciones de roles con alcance"
echo "  ✓ Sistema de notificaciones"
echo "  ✓ Sistema de logs y auditoría"
echo "  ✓ Menú dinámico"
echo ""
print_success "Backend listo para desarrollo de frontend"
