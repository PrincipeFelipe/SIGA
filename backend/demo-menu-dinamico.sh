#!/bin/bash
# ============================================================================
# DEMO DEL MENÚ DINÁMICO
# ============================================================================
# Este script demuestra cómo el menú se adapta según los permisos del usuario
# ============================================================================

BASE_URL="http://localhost:5000/api"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════════════════"
echo "                    🎯 DEMO: MENÚ DINÁMICO                         "
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Función para login y obtener menú
test_user_menu() {
    local username=$1
    local password=$2
    local description=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}👤 Usuario: $username${NC}"
    echo -e "${YELLOW}   Descripción: $description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Login
    LOGIN_RESPONSE=$(curl -s -c "cookies-$username.txt" -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$username\", \"password\": \"$password\"}")
    
    if echo "$LOGIN_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Login exitoso${NC}"
        
        # Obtener menú
        MENU_RESPONSE=$(curl -s -b "cookies-$username.txt" "$BASE_URL/menu")
        
        if echo "$MENU_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
            TOTAL=$(echo "$MENU_RESPONSE" | jq '.total')
            echo -e "${GREEN}✅ Menú cargado: $TOTAL aplicaciones disponibles${NC}"
            echo ""
            echo -e "${CYAN}📋 Aplicaciones visibles en el sidebar:${NC}"
            echo "$MENU_RESPONSE" | jq -r '.menu[] | "   " + (.orden | tostring) + ". " + .nombre + " (" + .ruta + ")"'
            echo ""
            
            # Mostrar descripción de permisos
            echo -e "${YELLOW}ℹ️  Este usuario puede ver estas aplicaciones porque:${NC}"
            case "$username" in
                "admin")
                    echo "   → Tiene el rol 'Admin Total' con acceso completo"
                    ;;
                "jefe.zona.norte")
                    echo "   → Tiene permisos de gestión sobre su zona"
                    ;;
                "R84101K")
                    echo "   → Tiene permisos limitados según su rol"
                    ;;
            esac
        else
            echo -e "${RED}❌ Error obteniendo menú${NC}"
            echo "$MENU_RESPONSE" | jq '.'
        fi
    else
        echo -e "${RED}❌ Error en login${NC}"
        echo "$LOGIN_RESPONSE" | jq '.'
    fi
    
    echo ""
    rm -f "cookies-$username.txt"
}

# Probar diferentes usuarios
echo -e "${GREEN}🔍 Probando diferentes usuarios para demostrar el menú dinámico...${NC}"
echo ""

# Usuario 1: Admin (acceso completo)
test_user_menu "admin" "Admin123!" "Administrador del Sistema - Acceso Total"

# Usuario 2: Jefe de Zona (acceso medio)
test_user_menu "jefe.zona.norte" "Jefe123!" "Jefe de Zona Norte - Permisos de Gestión"

# Usuario 3: Usuario básico
test_user_menu "R84101K" "User123!" "Usuario Básico - Permisos Limitados"

echo "═══════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Demo completada${NC}"
echo ""
echo -e "${CYAN}📝 Conclusión:${NC}"
echo "   El sidebar muestra ÚNICAMENTE las aplicaciones para las que"
echo "   el usuario tiene el permiso requerido. Esto proporciona:"
echo ""
echo "   ✓ Mayor seguridad (el usuario no ve lo que no puede usar)"
echo "   ✓ Mejor UX (interfaz más limpia y relevante)"
echo "   ✓ Menor confusión (evita intentos de acceso denegado)"
echo ""
echo -e "${YELLOW}🌐 Prueba tú mismo:${NC}"
echo "   1. Abre http://localhost:3000"
echo "   2. Inicia sesión con diferentes usuarios"
echo "   3. Observa cómo el sidebar cambia automáticamente"
echo "═══════════════════════════════════════════════════════════════════"
