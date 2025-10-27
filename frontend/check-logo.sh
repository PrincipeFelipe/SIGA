#!/bin/bash

# ============================================================================
# Script para verificar y colocar el logo de la Comandancia
# ============================================================================

LOGO_DIR="/home/siga/Proyectos/SIGA/frontend/src/assets/images"
LOGO_FILE="$LOGO_DIR/logo.png"

echo "=============================================="
echo "  Verificación del Logo de la Comandancia"
echo "=============================================="
echo ""

# Verificar si existe el archivo
if [ -f "$LOGO_FILE" ]; then
    echo "✅ El archivo logo.png EXISTE"
    echo "   Ubicación: $LOGO_FILE"
    echo ""
    
    # Mostrar información del archivo
    echo "📊 Información del archivo:"
    ls -lh "$LOGO_FILE" | awk '{print "   Tamaño: " $5}'
    file "$LOGO_FILE" | sed 's/^/   /'
    
    # Verificar dimensiones si tiene imagemagick instalado
    if command -v identify &> /dev/null; then
        echo ""
        echo "📐 Dimensiones:"
        identify -format "   %wx%h píxeles\n" "$LOGO_FILE"
    fi
    
    echo ""
    echo "🎨 El logo se mostrará en la parte superior del Sidebar"
    
else
    echo "⚠️  El archivo logo.png NO EXISTE"
    echo ""
    echo "📝 Instrucciones para agregar el logo:"
    echo ""
    echo "1. Consigue el logo de la Comandancia en formato PNG"
    echo "2. Asegúrate de que tenga fondo transparente"
    echo "3. Dimensiones recomendadas: 150x150 px o superior"
    echo "4. Peso recomendado: menos de 100KB"
    echo ""
    echo "5. Copia el archivo a la ubicación:"
    echo "   $LOGO_FILE"
    echo ""
    echo "6. Comando para copiar (ejemplo):"
    echo "   cp /ruta/a/tu/logo.png $LOGO_FILE"
    echo ""
    echo "Mientras tanto, se mostrará un placeholder con el icono de escudo."
fi

echo ""
echo "=============================================="
echo "  Carpeta de imágenes: $LOGO_DIR"
echo "=============================================="
echo ""

# Listar contenido de la carpeta
echo "📂 Contenido actual:"
ls -lah "$LOGO_DIR" | tail -n +4 | awk '{print "   " $9 " (" $5 ")"}'

echo ""
echo "✅ Verificación completada"
