#!/bin/bash
# ============================================================================
# SCRIPT DE PRUEBA COMPLETA DE TODOS LOS ENDPOINTS
# ============================================================================

BASE_URL="http://localhost:5000"
COOKIE_FILE="/tmp/cookies.txt"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de pruebas
TOTAL=0
PASSED=0
FAILED=0

echo "═══════════════════════════════════════════════════════"
echo "  PRUEBAS DE ENDPOINTS - SIGA Backend"
echo "═══════════════════════════════════════════════════════"
echo ""

# Función para probar un endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local auth=$4
    local expected_status=${5:-200}
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$auth" = "true" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -b $COOKIE_FILE)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} | $name | HTTP $status_code"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} | $name | HTTP $status_code (esperado $expected_status)"
        echo "   Respuesta: $(echo $body | jq -r '.message // .error // .')"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ============================================================================
# 1. HEALTH CHECK (público)
# ============================================================================
echo -e "${BLUE}━━━ 1. HEALTH CHECK ━━━${NC}"
test_endpoint "Health Check" GET "/health" false 200
echo ""

# ============================================================================
# 2. AUTENTICACIÓN
# ============================================================================
echo -e "${BLUE}━━━ 2. AUTENTICACIÓN ━━━${NC}"

# Login
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Password123!"}' \
    -c $COOKIE_FILE)

if echo $response | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} | Login Admin | HTTP 200"
    TOTAL=$((TOTAL + 1))
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} | Login Admin"
    echo "   Respuesta: $(echo $response | jq -r '.message')"
    TOTAL=$((TOTAL + 1))
    FAILED=$((FAILED + 1))
    exit 1
fi

test_endpoint "Verificar Sesión (Me)" GET "/api/auth/me" true 200
echo ""

# ============================================================================
# 3. USUARIOS
# ============================================================================
echo -e "${BLUE}━━━ 3. USUARIOS ━━━${NC}"
test_endpoint "Listar Usuarios" GET "/api/usuarios?limite=10" true 200
test_endpoint "Ver Usuario por ID" GET "/api/usuarios/1" true 200
test_endpoint "Listar Usuarios (sin descendientes)" GET "/api/usuarios?incluir_descendientes=false" true 200
echo ""

# ============================================================================
# 4. UNIDADES
# ============================================================================
echo -e "${BLUE}━━━ 4. UNIDADES ━━━${NC}"
test_endpoint "Árbol de Unidades" GET "/api/unidades" true 200
test_endpoint "Lista Plana de Unidades" GET "/api/unidades/lista" true 200
test_endpoint "Ver Unidad por ID" GET "/api/unidades/1" true 200
test_endpoint "Descendientes de Unidad" GET "/api/unidades/1/descendientes" true 200
echo ""

# ============================================================================
# 5. ROLES
# ============================================================================
echo -e "${BLUE}━━━ 5. ROLES ━━━${NC}"
test_endpoint "Listar Roles" GET "/api/roles" true 200
test_endpoint "Ver Rol por ID" GET "/api/roles/1" true 200
test_endpoint "Permisos de Rol" GET "/api/roles/1/permisos" true 200
echo ""

# ============================================================================
# 6. PERMISOS
# ============================================================================
echo -e "${BLUE}━━━ 6. PERMISOS ━━━${NC}"
test_endpoint "Listar Permisos" GET "/api/permisos" true 200
test_endpoint "Permisos por Recurso" GET "/api/permisos/por-recurso" true 200
test_endpoint "Ver Permiso por ID" GET "/api/permisos/1" true 200
echo ""

# ============================================================================
# 7. ROLES-ALCANCE (Usuario_Roles_Alcance)
# ============================================================================
echo -e "${BLUE}━━━ 7. ROLES Y ALCANCE ━━━${NC}"
test_endpoint "Ver Roles de Usuario" GET "/api/usuarios/1/roles-alcance" true 200
echo ""

# ============================================================================
# 8. NOTIFICACIONES
# ============================================================================
echo -e "${BLUE}━━━ 8. NOTIFICACIONES ━━━${NC}"
test_endpoint "Listar Notificaciones" GET "/api/notificaciones?limite=5" true 200
test_endpoint "Contar No Leídas" GET "/api/notificaciones/no-leidas" true 200
echo ""

# ============================================================================
# 9. LOGS
# ============================================================================
echo -e "${BLUE}━━━ 9. LOGS DE AUDITORÍA ━━━${NC}"
test_endpoint "Listar Logs" GET "/api/logs?limite=10" true 200
test_endpoint "Estadísticas de Logs" GET "/api/logs/estadisticas" true 200
echo ""

# ============================================================================
# 10. MENÚ DINÁMICO
# ============================================================================
echo -e "${BLUE}━━━ 10. MENÚ DINÁMICO ━━━${NC}"
test_endpoint "Obtener Menú del Usuario" GET "/api/menu" true 200
echo ""

# ============================================================================
# RESUMEN
# ============================================================================
echo "═══════════════════════════════════════════════════════"
echo "  RESUMEN DE PRUEBAS"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}Total de pruebas:${NC} $TOTAL"
echo -e "${GREEN}✅ Pasadas:${NC} $PASSED"
echo -e "${RED}❌ Fallidas:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                            ║${NC}"
    echo -e "${GREEN}║   ✅ TODAS LAS PRUEBAS PASARON            ║${NC}"
    echo -e "${GREEN}║                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                            ║${NC}"
    echo -e "${RED}║   ❌ ALGUNAS PRUEBAS FALLARON             ║${NC}"
    echo -e "${RED}║                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    exit 1
fi
