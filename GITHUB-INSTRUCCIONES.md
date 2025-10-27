# 🚀 GitHub - Instrucciones de Uso

## Estado Actual

✅ **Repositorio configurado y listo para push**

- **Remote:** https://github.com/PrincipeFelipe/SIGA.git
- **Rama actual:** main
- **Último commit:** `610a6bd` - feat: implementación completa del sistema SIGA
- **Archivos commitados:** 111 archivos (+36,683 líneas)
- **Estado:** Árbol de trabajo limpio

---

## 📤 Subir Cambios a GitHub

### Opción 1: Push Simple (Recomendado)

```bash
git push origin main
```

### Opción 2: Push con Verificación

```bash
# Ver qué se va a subir
git log origin/main..main --oneline

# Subir cambios
git push origin main

# Verificar en GitHub
git remote show origin
```

### Opción 3: Push Forzado (⚠️ Solo si es necesario)

```bash
# CUIDADO: Esto sobrescribe el historial remoto
git push -f origin main
```

---

## 🔄 Mantener el Repositorio Actualizado

### Flujo de Trabajo Diario

```bash
# 1. Actualizar tu rama local
git pull origin main

# 2. Crear rama para nueva funcionalidad
git checkout -b feature/nombre-funcionalidad

# 3. Hacer cambios y commits
git add .
git commit -m "feat: descripción de cambios"

# 4. Subir rama y crear Pull Request
git push origin feature/nombre-funcionalidad
```

### Sincronizar con Remoto

```bash
# Ver estado
git status

# Ver diferencias con remoto
git diff origin/main

# Actualizar referencias remotas
git fetch origin

# Actualizar rama actual
git pull origin main
```

---

## 🏷️ Uso de Tags (Versiones)

### Crear Tag

```bash
# Tag simple
git tag v1.0.0

# Tag con mensaje
git tag -a v1.0.0 -m "Primera versión estable"

# Subir tags
git push origin v1.0.0

# Subir todos los tags
git push origin --tags
```

### Listar Tags

```bash
git tag
git tag -l "v1.*"
```

---

## 🌿 Gestión de Ramas

### Crear y Cambiar de Rama

```bash
# Crear y cambiar
git checkout -b nueva-rama

# Solo crear
git branch nueva-rama

# Solo cambiar
git checkout nombre-rama
```

### Ver Ramas

```bash
# Locales
git branch

# Remotas
git branch -r

# Todas
git branch -a
```

### Eliminar Ramas

```bash
# Local
git branch -d nombre-rama

# Remota
git push origin --delete nombre-rama
```

---

## 🔙 Deshacer Cambios

### Deshacer Último Commit (Mantener Cambios)

```bash
git reset --soft HEAD~1
```

### Deshacer Último Commit (Eliminar Cambios)

```bash
git reset --hard HEAD~1
```

### Revertir un Commit

```bash
git revert <commit-hash>
```

---

## 📊 Ver Historial

### Log Básico

```bash
# Completo
git log

# Una línea por commit
git log --oneline

# Últimos 10 commits
git log -10

# Con gráfico
git log --graph --oneline --all
```

### Log de un Archivo

```bash
git log --follow archivo.js
```

---

## 🔍 Buscar en el Código

### Buscar Texto

```bash
# En archivos actuales
git grep "texto_a_buscar"

# En commits específicos
git grep "texto" <commit-hash>
```

### Buscar Commits

```bash
# Por mensaje
git log --grep="palabra"

# Por autor
git log --author="nombre"
```

---

## 🛡️ Buenas Prácticas

### Commits

- ✅ **Hacer commits frecuentes** con cambios pequeños
- ✅ **Mensajes descriptivos** siguiendo Conventional Commits
- ✅ **Un commit por funcionalidad** lógica
- ❌ Evitar commits con `node_modules/`, `.env`, archivos temporales

### Pull Requests

- ✅ **Título claro** y descriptivo
- ✅ **Descripción detallada** de cambios
- ✅ **Tests pasando** antes de merge
- ✅ **Código revisado** por al menos una persona
- ✅ **Conflictos resueltos** antes de merge

### Seguridad

- ❌ **NUNCA** commitear `.env` con credenciales reales
- ❌ **NUNCA** commitear contraseñas o tokens
- ❌ **NUNCA** commitear claves privadas (`.pem`, `.key`)
- ✅ **SIEMPRE** usar `.env.example` como plantilla
- ✅ **SIEMPRE** verificar `.gitignore` está actualizado

---

## 🆘 Problemas Comunes

### "Your branch is behind 'origin/main'"

```bash
git pull origin main
```

### "Merge conflict"

```bash
# 1. Ver archivos en conflicto
git status

# 2. Editar archivos manualmente y resolver conflictos
#    Buscar: <<<<<<< HEAD, =======, >>>>>>> 

# 3. Marcar como resuelto
git add archivo-resuelto.js

# 4. Completar merge
git commit
```

### "Permission denied (publickey)"

```bash
# Verificar SSH keys
ssh -T git@github.com

# Si falla, configurar SSH key en GitHub
ssh-keygen -t ed25519 -C "tu_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copiar y pegar en GitHub → Settings → SSH Keys
```

### "Failed to push"

```bash
# Si el remoto tiene commits que no tienes localmente
git pull --rebase origin main
git push origin main
```

---

## 📚 Recursos

- [Documentación Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Guía de Contribución](./CONTRIBUTING.md)

---

## ✅ Checklist Pre-Push

Antes de hacer `git push`, verifica:

- [ ] Código compila sin errores
- [ ] Tests pasan (si existen)
- [ ] No hay archivos sensibles en staging (`.env`, contraseñas)
- [ ] Mensaje de commit es descriptivo
- [ ] Has hecho `git pull` para evitar conflictos
- [ ] `.gitignore` está actualizado

---

**¿Listo para hacer push?**

```bash
git push origin main
```
