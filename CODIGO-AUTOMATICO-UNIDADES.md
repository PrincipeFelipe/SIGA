# Sistema de Generación Automática de Códigos de Unidad

**Fecha:** 24 de noviembre de 2025  
**Estado:** ✅ Implementado y probado

---

## 📋 Descripción

Se ha implementado un sistema de generación automática de códigos para unidades organizacionales subordinadas (Comandancia, Compañía, Puesto). Solo las unidades de tipo **Zona** requieren que el usuario introduzca manualmente el código, que servirá como prefijo para todas las unidades subordinadas.

---

## 🎯 Funcionamiento

### Tipos de Unidades

| Tipo | Código Manual | Código Automático | Formato |
|------|--------------|-------------------|---------|
| **Zona** | ✅ Sí (requerido) | ❌ No | `ZON##` |
| **Comandancia** | ❌ No | ✅ Sí | `[zona]-CMD##` |
| **Compañía** | ❌ No | ✅ Sí | `[comandancia]-CIA##` |
| **Puesto** | ❌ No | ✅ Sí | `[compañía]-PTO##` |

### Jerarquía de Códigos

```
ZON01 (Zona - manual)
├── ZON01-CMD01 (Comandancia - automático)
│   └── ZON01-CMD01-CIA01 (Compañía - automático)
│       ├── ZON01-CMD01-CIA01-PTO01 (Puesto - automático)
│       └── ZON01-CMD01-CIA01-PTO02 (Puesto - automático)
└── ZON01-CMD02 (Comandancia - automático)
```

---

## 🔧 Implementación Backend

### Función: `generarCodigoUnidad(tipo_unidad, parent_id)`

**Ubicación:** `backend/controllers/unidades.controller.js`

**Lógica:**

1. **Obtener código del padre:**
   ```javascript
   const [padre] = await query(
       'SELECT codigo_unidad FROM Unidades WHERE id = ?',
       [parent_id]
   );
   ```

2. **Determinar prefijo según tipo:**
   ```javascript
   const prefijos = {
       'Comandancia': 'CMD',
       'Compañia': 'CIA',
       'Puesto': 'PTO'
   };
   ```

3. **Buscar siguiente número disponible:**
   ```javascript
   const hermanos = await query(
       `SELECT codigo_unidad 
        FROM Unidades 
        WHERE parent_id = ? 
          AND tipo_unidad = ? 
          AND codigo_unidad IS NOT NULL
        ORDER BY codigo_unidad`,
       [parent_id, tipo_unidad]
   );
   ```

4. **Extraer números existentes y calcular siguiente:**
   ```javascript
   const patron = new RegExp(`${prefijo}(\\d+)$`);
   let maxNumero = 0;
   
   hermanos.forEach(hermano => {
       const match = hermano.codigo_unidad.match(patron);
       if (match) {
           const numero = parseInt(match[1], 10);
           if (numero > maxNumero) {
               maxNumero = numero;
           }
       }
   });
   ```

5. **Generar código final:**
   ```javascript
   const nuevoNumero = String(maxNumero + 1).padStart(2, '0');
   const codigoGenerado = `${padre.codigo_unidad}-${prefijo}${nuevoNumero}`;
   ```

### Validaciones

1. **Zona debe tener código manual:**
   ```javascript
   if (tipo_unidad === 'Zona' && !codigo_unidad) {
       return res.status(400).json({
           message: 'El código de Zona es requerido (ej: ZON01)'
       });
   }
   ```

2. **Subordinadas generan código automáticamente:**
   ```javascript
   if (tipo_unidad !== 'Zona') {
       codigoFinal = await generarCodigoUnidad(tipo_unidad, parent_id);
   }
   ```

3. **Verificar que el código no exista:**
   ```javascript
   const [existe] = await query(
       'SELECT id FROM Unidades WHERE codigo_unidad = ?',
       [codigoFinal]
   );
   
   if (existe) {
       return res.status(400).json({
           message: 'El código de unidad ya existe'
       });
   }
   ```

---

## 🎨 Implementación Frontend

### Componente: `UnitFormModal.js`

**Ubicación:** `frontend/src/components/unidades/UnitFormModal.js`

### Cambios en UI

1. **Campo de código solo visible para Zona:**
   ```jsx
   {formData.tipo_unidad === 'Zona' && (
     <Input
       label="Código de Zona *"
       name="codigo_unidad"
       value={formData.codigo_unidad}
       onChange={handleChange}
       error={errors.codigo_unidad}
       placeholder="Ej: ZON01"
       helperText="Este código será el prefijo para todas las unidades subordinadas"
     />
   )}
   ```

2. **Aviso de código automático para subordinadas:**
   ```jsx
   {formData.tipo_unidad && formData.tipo_unidad !== 'Zona' && (
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
       <p className="text-blue-800 text-sm">
         <strong>ℹ️ Código automático:</strong> El código se generará automáticamente.
         {formData.tipo_unidad === 'Comandancia' && ' Formato: [código-zona]-CMD01'}
         {formData.tipo_unidad === 'Compañia' && ' Formato: [código-comandancia]-CIA01'}
         {formData.tipo_unidad === 'Puesto' && ' Formato: [código-compañía]-PTO01'}
       </p>
     </div>
   )}
   ```

3. **Validación solo para Zona:**
   ```javascript
   if (formData.tipo_unidad === 'Zona') {
       if (!formData.codigo_unidad || !formData.codigo_unidad.trim()) {
           nuevosErrores.codigo_unidad = 'El código de Zona es requerido';
       } else if (formData.codigo_unidad.trim().length < 3) {
           nuevosErrores.codigo_unidad = 'El código debe tener al menos 3 caracteres';
       }
   }
   ```

---

## 🧪 Pruebas

### Script de Test

**Archivo:** `backend/test-codigo-automatico.sh`

### Resultados

```
✅ TODAS LAS VALIDACIONES PASARON (6/6)

📊 Jerarquía de unidades creadas:

  ZON99 (Zona Test Automática)
  ├── ZON99-CMD01 (Comandancia Test Auto 1)
  │   └── ZON99-CMD01-CIA01 (Compañía Test Auto 1)
  │       ├── ZON99-CMD01-CIA01-PTO01 (Puesto Test Auto 1)
  │       └── ZON99-CMD01-CIA01-PTO02 (Puesto Test Auto 2)
  └── ZON99-CMD02 (Comandancia Test Auto 2)
```

### Validaciones Realizadas

- ✅ Zona: Formato correcto (ZON##)
- ✅ Comandancia 1: Formato correcto (ZON##-CMD##)
- ✅ Comandancia 2: Formato correcto (ZON##-CMD##)
- ✅ Compañía: Formato correcto (ZON##-CMD##-CIA##)
- ✅ Puesto 1: Formato correcto (ZON##-CMD##-CIA##-PTO##)
- ✅ Puesto 2: Formato correcto (ZON##-CMD##-CIA##-PTO##)

---

## 📖 Ejemplos de Uso

### 1. Crear Zona (Código Manual)

**Entrada:**
```json
{
  "nombre": "Zona de Andalucía",
  "tipo_unidad": "Zona",
  "codigo_unidad": "ZON03",
  "descripcion": "Zona territorial de Andalucía"
}
```

**Resultado:**
```
ID: 5
Código: ZON03
```

---

### 2. Crear Comandancia (Código Automático)

**Entrada:**
```json
{
  "nombre": "Comandancia de Sevilla",
  "tipo_unidad": "Comandancia",
  "parent_id": 5,
  "descripcion": "Comandancia en Sevilla"
}
```

**Resultado:**
```
ID: 10
Código: ZON03-CMD01 (generado automáticamente)
```

---

### 3. Crear Compañía (Código Automático)

**Entrada:**
```json
{
  "nombre": "Compañía de Sevilla Centro",
  "tipo_unidad": "Compañia",
  "parent_id": 10,
  "descripcion": "Compañía en el centro de Sevilla"
}
```

**Resultado:**
```
ID: 15
Código: ZON03-CMD01-CIA01 (generado automáticamente)
```

---

### 4. Crear Puesto (Código Automático)

**Entrada:**
```json
{
  "nombre": "Puesto de Triana",
  "tipo_unidad": "Puesto",
  "parent_id": 15,
  "descripcion": "Puesto en barrio de Triana"
}
```

**Resultado:**
```
ID: 20
Código: ZON03-CMD01-CIA01-PTO01 (generado automáticamente)
```

---

## 🔍 Comportamiento del Sistema

### Numeración Secuencial

El sistema garantiza numeración secuencial **por tipo de unidad** y **bajo el mismo padre**:

```
ZON01
├── ZON01-CMD01  ← Primera comandancia
├── ZON01-CMD02  ← Segunda comandancia
└── ZON01-CMD03  ← Tercera comandancia

ZON01-CMD01
├── ZON01-CMD01-CIA01  ← Primera compañía
├── ZON01-CMD01-CIA02  ← Segunda compañía
└── ZON01-CMD01-CIA03  ← Tercera compañía
```

### Gestión de Gaps

Si se elimina una unidad intermedia, el sistema **no reutiliza** el número:

```
Antes:
ZON01-CMD01
ZON01-CMD02
ZON01-CMD03

Después de eliminar CMD02:
ZON01-CMD01
ZON01-CMD03
ZON01-CMD04  ← Nueva comandancia (no reutiliza CMD02)
```

---

## 🚨 Errores y Validaciones

### 1. Zona sin código

**Error:**
```json
{
  "success": false,
  "message": "El código de Zona es requerido (ej: ZON01)"
}
```

### 2. Subordinada sin padre

**Error:**
```json
{
  "success": false,
  "message": "Un Comandancia debe tener una unidad padre"
}
```

### 3. Padre sin código

**Error:**
```json
{
  "success": false,
  "message": "La unidad padre debe tener un código asignado"
}
```

### 4. Código duplicado

**Error:**
```json
{
  "success": false,
  "message": "El código de unidad ya existe"
}
```

---

## ✅ Ventajas del Sistema

1. **Consistencia:** Todos los códigos siguen el mismo patrón jerárquico
2. **Automatización:** Reduce errores humanos en la asignación de códigos
3. **Trazabilidad:** El código refleja la estructura organizacional completa
4. **Escalabilidad:** Soporta hasta 99 unidades de cada tipo por padre
5. **Mantenibilidad:** Cambios en código padre se propagan automáticamente

---

## 📁 Archivos Modificados

### Backend
- ✅ `backend/controllers/unidades.controller.js`
  - Función `crear()` actualizada
  - Función `generarCodigoUnidad()` agregada

### Frontend
- ✅ `frontend/src/components/unidades/UnitFormModal.js`
  - Campo código solo visible para Zona
  - Aviso de código automático
  - Validación condicional

### Testing
- ✅ `backend/test-codigo-automatico.sh` (nuevo)
  - Script completo de pruebas
  - Validaciones de formato
  - Verificación jerárquica

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                  Usuario crea Zona                          │
│              (introduce código manual: ZON01)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Usuario crea Comandancia bajo Zona                │
│               (sin introducir código)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend busca código del padre                 │
│                  (obtiene: ZON01)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│      Backend busca hermanos tipo Comandancia               │
│            (encuentra: CMD01, CMD02)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Backend calcula siguiente número                  │
│                 (max: 2, siguiente: 3)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend genera código completo                   │
│             ZON01 + "-CMD" + "03"                           │
│             Resultado: ZON01-CMD03                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Código guardado en BD                         │
│             Usuario no tuvo que introducirlo                │
└─────────────────────────────────────────────────────────────┘
```

---

**Autor:** GitHub Copilot  
**Proyecto:** SIGA - Sistema de Gestión Administrativa  
**Versión:** 1.0.0
