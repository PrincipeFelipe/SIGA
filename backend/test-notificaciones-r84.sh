#!/bin/bash

# Script de prueba del sistema de notificaciones
# Fecha: 10 de noviembre de 2025

echo "=========================================="
echo "  PRUEBA DEL SISTEMA DE NOTIFICACIONES"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Obtener token de R84101K
echo "1️⃣  Obteniendo token de R84101K..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"R84101K","password":"klandemo"}' \
  -c cookies-r84.txt)

if echo "$TOKEN_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
else
    echo -e "${RED}❌ Login fallido${NC}"
    exit 1
fi

# 2. Obtener contador de notificaciones
echo ""
echo "2️⃣  Obteniendo contador de notificaciones no leídas..."
CONTADOR=$(curl -s http://localhost:5000/notificaciones/contador \
  -b cookies-r84.txt)

echo "$CONTADOR" | jq '.'

if echo "$CONTADOR" | grep -q "no_leidas"; then
    NO_LEIDAS=$(echo "$CONTADOR" | jq -r '.data.no_leidas')
    echo -e "${GREEN}✅ Contador obtenido: $NO_LEIDAS notificaciones no leídas${NC}"
else
    echo -e "${RED}❌ Error al obtener contador${NC}"
    exit 1
fi

# 3. Listar notificaciones no leídas
echo ""
echo "3️⃣  Listando notificaciones no leídas..."
NOTIFICACIONES=$(curl -s "http://localhost:5000/notificaciones?leida=false&limit=5" \
  -b cookies-r84.txt)

echo "$NOTIFICACIONES" | jq '.data[] | {id, titulo, tipo, created_at}'

if echo "$NOTIFICACIONES" | grep -q "data"; then
    TOTAL=$(echo "$NOTIFICACIONES" | jq -r '.data | length')
    echo -e "${GREEN}✅ Se obtuvieron $TOTAL notificaciones${NC}"
else
    echo -e "${RED}❌ Error al listar notificaciones${NC}"
    exit 1
fi

# 4. Verificar tipos de notificaciones
echo ""
echo "4️⃣  Verificando tipos de notificaciones..."
echo "$NOTIFICACIONES" | jq -r '.data[] | "\(.tipo): \(.titulo)"' | while read line; do
    if echo "$line" | grep -q "error"; then
        echo -e "${RED}   🔴 $line${NC}"
    elif echo "$line" | grep -q "warning"; then
        echo -e "${YELLOW}   ⚠️  $line${NC}"
    else
        echo "   ℹ️  $line"
    fi
done

# 5. Verificar tareas del usuario
echo ""
echo "5️⃣  Verificando tareas del usuario en base de datos..."
mysql -u root -pklandemo siga_db << 'EOF' 2>/dev/null | tail -n +2
SELECT 
    id,
    titulo,
    fecha_limite,
    estado,
    CASE 
        WHEN fecha_limite < CURDATE() THEN 'VENCIDA'
        WHEN DATEDIFF(fecha_limite, CURDATE()) BETWEEN 0 AND 3 THEN 'PROXIMA A VENCER'
        ELSE 'NORMAL'
    END as estado_alerta
FROM Tareas
WHERE asignado_a = 10
ORDER BY fecha_limite;
EOF

# 6. Resumen final
echo ""
echo "=========================================="
echo "           RESUMEN DE PRUEBAS"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Sistema de notificaciones operativo${NC}"
echo "   - Endpoint /notificaciones/contador: OK"
echo "   - Endpoint /notificaciones (listar): OK"
echo "   - Notificaciones en BD: $NO_LEIDAS no leídas"
echo ""
echo "📊 Estado del usuario R84101K:"
echo "   - Notificaciones no leídas: $NO_LEIDAS"
echo "   - Tareas asignadas: Ver tabla arriba"
echo ""
echo "🔗 URLs de prueba:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo "   - Login:    Usuario: R84101K / Password: klandemo"
echo ""

# Limpiar cookies
rm -f cookies-r84.txt

echo "=========================================="
echo "  PRUEBA COMPLETADA"
echo "=========================================="
