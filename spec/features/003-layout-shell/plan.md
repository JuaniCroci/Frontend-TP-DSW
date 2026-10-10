# 003 · Layout shell — Plan

## Enfoque

Agregar navegación con React Router y una portada pública estática, sin adelantar el catálogo ni crear datos de productos ficticios. El shell comparte cabecera y pie; el login queda como ruta independiente para conservar su presentación enfocada.

## Interfaces externas

- `AuthProvider` y `useAuth()` de la feature 002 para mostrar la sesión y cerrarla.
- React Router 7 para rutas, navegación y retorno a la portada luego del login.
- No se agregan endpoints ni dependencias.

## Implementación

1. Crear `MainLayout`, `Header` y `Footer` en `src/app/shared/layout/`.
2. Crear `HomePage` con hero y tarjetas informativas para categorías generales.
3. Configurar `/`, `/login` y fallback en `src/App.tsx`.
4. Navegar a `/` después de un login exitoso.
5. Cubrir el shell, navegación, sesión y fallback con tests de feature.

## Riesgos

- La navegación depende de que el `AuthProvider` envuelva el router.
- Los destinos del catálogo no deben aparentar estar implementados; los accesos de la portada se limitan a secciones locales.

## Desvíos de implementación

Se mantiene la portada sin imágenes externas ni catálogo de ejemplo para no introducir contenido o dependencias ajenas al contrato actual.
