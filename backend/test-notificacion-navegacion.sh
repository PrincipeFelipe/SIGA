#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBA: Navegación desde Notificaciones a Tareas
# Verifica que las URLs de notificaciones funcionen correctamente
# ============================================================================

echo "🧪 TEST: Navegación de Notificaciones a Tareas"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
USUARIO="R84101K"
PASSWORD="klandemo"
COOKIES_FILE="/tmp/test-notif-cookies.txt"

echo "📝 Configuración:"
echo "   Backend:  $API_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   Usuario:  $USUARIO"
echo ""

# Paso 1: Login
echo "🔐 Paso 1: Login como $USUARIO"
LOGIN_RESPONSE=$(curl -s -c $COOKIES_FILE -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USUARIO\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "   ${GREEN}✅ Login exitoso${NC}"
else
  echo -e "   ${RED}❌ Error en login${NC}"
  echo "   Respuesta: $LOGIN_RESPONSE"
  exit 1
fi

echo ""

# Paso 2: Obtener notificaciones
echo "🔔 Paso 2: Obtener notificaciones del usuario"
NOTIFICACIONES=$(curl -s -b $COOKIES_FILE "$API_URL/notificaciones?leida=false&limit=5")

if echo "$NOTIFICACIONES" | grep -q '"success":true'; then
  echo -e "   ${GREEN}✅ Notificaciones obtenidas${NC}"
  
  # Extraer información de notificaciones
  NUM_NOTIF=$(echo "$NOTIFICACIONES" | jq -r '.data | length')
  echo "   Total de notificaciones: $NUM_NOTIF"
  
  if [ "$NUM_NOTIF" -gt 0 ]; then
    echo ""
    echo "   📋 Detalles de notificaciones:"
    echo "$NOTIFICACIONES" | jq -r '.data[] | "   - ID: \(.id) | Título: \(.titulo) | URL: \(.url)"'
    
    # Extraer la primera URL
    PRIMERA_URL=$(echo "$NOTIFICACIONES" | jq -r '.data[0].url')
    PRIMERA_ID=$(echo "$NOTIFICACIONES" | jq -r '.data[0].id')
    
    echo ""
    echo "   🎯 Primera notificación:"
    echo "      ID: $PRIMERA_ID"
    echo "      URL: $PRIMERA_URL"
  else
    echo -e "   ${YELLOW}⚠️  No hay notificaciones no leídas${NC}"
    PRIMERA_URL=""
  fi
else
  echo -e "   ${RED}❌ Error al obtener notificaciones${NC}"
  exit 1
fi

echo ""

# Paso 3: Verificar que la URL de tarea existe
if [ ! -z "$PRIMERA_URL" ]; then
  echo "🔍 Paso 3: Verificar URL de la notificación"
  
  # Extraer el ID de la tarea de la URL
  TAREA_ID=$(echo "$PRIMERA_URL" | grep -oP '/tareas/\K\d+')
  
  if [ ! -z "$TAREA_ID" ]; then
    echo "   URL frontend esperada: /tareas/$TAREA_ID"
    echo "   URL backend esperada: /api/tareas/$TAREA_ID"
    echo "   Verificando que la tarea existe..."
    
    TAREA=$(curl -s -b $COOKIES_FILE "$API_URL/api/tareas/$TAREA_ID")
    
    if echo "$TAREA" | grep -q '"success":true'; then
      echo -e "   ${GREEN}✅ La tarea ID $TAREA_ID existe en el backend${NC}"
      
      TITULO_TAREA=$(echo "$TAREA" | jq -r '.data.titulo')
      ESTADO_TAREA=$(echo "$TAREA" | jq -r '.data.estado')
      
      echo "   Título: $TITULO_TAREA"
      echo "   Estado: $ESTADO_TAREA"
    else
      echo -e "   ${RED}❌ La tarea ID $TAREA_ID no existe${NC}"
      echo "   Respuesta: $TAREA"
    fi
  else
    echo -e "   ${RED}❌ No se pudo extraer el ID de la tarea de la URL${NC}"
  fi
fi

echo ""

# Paso 4: Verificar que la ruta existe en el frontend
echo "🌐 Paso 4: Verificar que la ruta existe en el frontend"
echo "   Comprobando App.js..."

if grep -q "path=\"/tareas/:id\"" "/home/siga/Proyectos/SIGA/frontend/src/App.js"; then
  echo -e "   ${GREEN}✅ Ruta /tareas/:id configurada en App.js${NC}"
else
  echo -e "   ${RED}❌ Ruta /tareas/:id NO encontrada en App.js${NC}"
fi

echo ""

# Paso 5: Verificar que TasksListPage acepta parámetros
echo "📄 Paso 5: Verificar que TasksListPage acepta parámetros"
echo "   Comprobando TasksListPage.js..."

if grep -q "useParams" "/home/siga/Proyectos/SIGA/frontend/src/pages/tareas/TasksListPage.js"; then
  echo -e "   ${GREEN}✅ TasksListPage usa useParams${NC}"
else
  echo -e "   ${RED}❌ TasksListPage NO usa useParams${NC}"
fi

if grep -q "cargarTareaDesdeURL" "/home/siga/Proyectos/SIGA/frontend/src/pages/tareas/TasksListPage.js"; then
  echo -e "   ${GREEN}✅ Función cargarTareaDesdeURL implementada${NC}"
else
  echo -e "   ${RED}❌ Función cargarTareaDesdeURL NO encontrada${NC}"
fi

echo ""

# Paso 6: Resumen de URLs
echo "📊 Paso 6: Resumen de URLs de notificaciones"
echo "   Consultando base de datos..."

mysql -u root -pklandemo siga_db -e "
SELECT 
  n.id AS notif_id,
  n.titulo,
  n.url,
  t.id AS tarea_id,
  t.titulo AS tarea_titulo,
  t.estado AS tarea_estado
FROM Notificaciones n
LEFT JOIN Tareas t ON n.url = CONCAT('/tareas/', t.id)
WHERE n.usuario_id = 10
ORDER BY n.id DESC
LIMIT 5;
" 2>/dev/null

echo ""

# Limpiar cookies
rm -f $COOKIES_FILE

# Resumen final
echo "================================================"
echo "✅ PRUEBA COMPLETADA"
echo ""
echo "📝 Instrucciones para prueba manual:"
echo "   1. Acceder a: ${BLUE}$FRONTEND_URL/notificaciones${NC}"
echo "   2. Hacer login como: ${BLUE}$USUARIO${NC}"
echo "   3. Click en una notificación"
echo "   4. Verificar que se abre el modal de detalle de tarea"
echo ""
echo "   Ejemplo de URL directa:"
if [ ! -z "$TAREA_ID" ]; then
  echo "   ${BLUE}$FRONTEND_URL/tareas/$TAREA_ID${NC}"
fi
echo ""
