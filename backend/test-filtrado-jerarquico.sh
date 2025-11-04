#!/bin/bash
# ============================================================================
# TEST DE FILTRADO JERÁRQUICO DE USUARIOS
# ============================================================================

BASE_URL="http://localhost:5000/api"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════════════════"
echo "           🔐 TEST: FILTRADO JERÁRQUICO DE USUARIOS                "
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Función para probar filtrado
test_usuario_filtrado() {
    local username=$1
    local password=$2
    local descripcion=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}👤 Usuario: $username${NC}"
    echo -e "${YELLOW}   $descripcion${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Login
    LOGIN=$(curl -s -c "cookies-$username.txt" -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$username\", \"password\": \"$password\"}")
    
    if echo "$LOGIN" | jq -e '.success == true' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Login exitoso${NC}"
        
        # Obtener usuarios accesibles
        USUARIOS=$(curl -s -b "cookies-$username.txt" "$BASE_URL/usuarios?limit=100")
        
        if echo "$USUARIOS" | jq -e '.success == true' > /dev/null 2>&1; then
            TOTAL=$(echo "$USUARIOS" | jq '.total')
            echo -e "${GREEN}✅ Usuarios accesibles: $TOTAL${NC}"
            echo ""
            echo -e "${CYAN}📋 Listado de usuarios que puede ver:${NC}"
            echo "$USUARIOS" | jq -r '.data[] | "   " + .username + " - " + .nombre_completo + " (" + .unidad_destino_nombre + ")"'
            echo ""
            
            # Explicación
            echo -e "${YELLOW}ℹ️  Este usuario puede ver estos usuarios porque:${NC}"
            case "$username" in
                "admin")
                    echo "   → Tiene rol 'Admin Total' con alcance en 'Zona de Navarra'"
                    echo "   → Puede ver todos los usuarios de la zona y descendientes"
                    ;;
                "jefe.zona.norte")
                    echo "   → Tiene rol 'Gestor de Unidad' con alcance en 'Zona de Andalucía'"
                    echo "   → Puede ver usuarios de su zona y unidades inferiores"
                    ;;
                "R84101K")
                    echo "   → Tiene rol 'Usuario Básico' con alcance en 'Puesto de Pamplona'"
                    echo "   → Solo puede ver usuarios de su propio puesto"
                    ;;
            esac
        else
            echo -e "${YELLOW}⚠️  Sin acceso a usuarios${NC}"
            echo "$USUARIOS" | jq '.'
        fi
    else
        echo -e "${RED}❌ Error en login${NC}"
    fi
    
    echo ""
    rm -f "cookies-$username.txt"
}

# Test 1: Admin (acceso total a su zona)
test_usuario_filtrado "admin" "Admin123!" "Admin Total - Zona de Navarra"

# Test 2: Jefe de Zona (acceso a toda su zona)
test_usuario_filtrado "jefe.zona.norte" "Password123!" "Gestor de Unidad - Zona de Andalucía"

# Test 3: Usuario de puesto (acceso solo a su puesto)
test_usuario_filtrado "R84101K" "klandemo" "Usuario Básico - Puesto de Pamplona"

echo "═══════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Pruebas completadas${NC}"
echo ""
echo -e "${CYAN}📝 Resumen del Filtrado Jerárquico:${NC}"
echo ""
echo "   El sistema filtra usuarios basándose en el ALCANCE del rol asignado:"
echo ""
echo "   1️⃣  Usuario con alcance en ZONA"
echo "      → Ve usuarios de: Zona + Comandancias + Compañías + Puestos"
echo ""
echo "   2️⃣  Usuario con alcance en COMANDANCIA"
echo "      → Ve usuarios de: Comandancia + Compañías + Puestos"
echo ""
echo "   3️⃣  Usuario con alcance en COMPAÑÍA"
echo "      → Ve usuarios de: Compañía + Puestos"
echo ""
echo "   4️⃣  Usuario con alcance en PUESTO"
echo "      → Ve usuarios de: Solo ese Puesto"
echo ""
echo "   ✓ El filtrado usa CTEs recursivos en SQL"
echo "   ✓ Totalmente automático y transparente"
echo "   ✓ Se aplica en todos los endpoints de usuarios"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
