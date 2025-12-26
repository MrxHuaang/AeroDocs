# Contexto e Instrucciones para Recrear el Proyecto AeroDocs

## 📋 CONTEXTO DEL PROYECTO

### Descripción General
**AeroDocs** es una aplicación web para la gestión de documentos de aviación. Permite a los usuarios subir documentos de aeronaves en formato ZIP o RAR, procesarlos y visualizarlos mediante un checklist jerárquico basado en estándares ICAO. Incluye un asistente de IA para consultas sobre los documentos del proyecto.

### Propósito
La aplicación facilita la auditoría y verificación de documentos de aeronaves según los estándares ICAO (Organización de Aviación Civil Internacional), permitiendo identificar qué documentos están presentes o faltantes en un proyecto.

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Estructura de Archivos
```
gemini-2.5-pro/
├── 1_login.html          # Página de inicio de sesión
├── 2_dashboard.html      # Dashboard principal con lista de proyectos
├── 3_project.html        # Vista detallada de un proyecto
├── css/
│   ├── main.css          # Estilos globales y variables CSS
│   ├── login.css         # Estilos específicos de login
│   ├── dashboard.css     # Estilos del dashboard
│   └── project.css       # Estilos de la vista de proyecto
└── js/
    ├── main.js           # Utilidades globales (protección de rutas, toasts)
    ├── auth.js           # Lógica de autenticación
    ├── dashboard.js      # Lógica del dashboard
    ├── project.js        # Lógica de la vista de proyecto
    └── mock-data.js      # Datos de prueba
```

### Tecnologías Utilizadas
- **HTML5** - Estructura
- **CSS3** - Estilos (con variables CSS, Flexbox, Grid)
- **JavaScript Vanilla** - Lógica (sin frameworks)
- **SessionStorage** - Gestión de sesión de usuario

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### 1. Sistema de Autenticación
- **Página de Login** (`1_login.html`)
  - Botón de inicio de sesión con Google (simulado)
  - Al hacer clic, guarda un flag en `sessionStorage` y redirige al dashboard
  - Diseño centrado con logo y branding

### 2. Dashboard de Proyectos (`2_dashboard.html`)
- **Lista de Proyectos**: Grid responsive que muestra tarjetas de proyectos
- **Crear Nuevo Proyecto**: Modal con formulario que incluye:
  - Campo de nombre del proyecto
  - Zona de arrastre y soltado (drag & drop) para archivos ZIP/RAR
  - Barra de progreso de carga simulada
  - Validación de tipo de archivo
- **Estados de Proyecto**: 
  - "Completed" (verde)
  - "Processing" (azul)
- **Navegación**: Cada tarjeta de proyecto es un enlace a la vista detallada

### 3. Vista de Proyecto (`3_project.html`)
- **Panel Izquierdo - Checklist ICAO**:
  - Estructura jerárquica expandible/colapsable
  - Iconos de estado (✓ Presente / ✗ Faltante)
  - Detalles expandibles por ítem (accordion) mostrando:
    - Componente
    - Referencia ICAO
    - Estado
    - Observación
  - Scroll independiente
- **Panel Derecho - Asistente de IA**:
  - Ventana de chat con historial de mensajes
  - Indicador de "pensando" con animación
  - Input para enviar mensajes
  - Mensaje inicial de bienvenida
  - Respuestas simuladas basadas en palabras clave

### 4. Sistema de Notificaciones
- Toasts (notificaciones emergentes) en la esquina superior derecha
- Tipos: success, error, info
- Animaciones de entrada y salida

---

## 🎨 ESPECIFICACIONES DE DISEÑO

### Paleta de Colores
```css
--primary-color: #2563EB (Blue-600)
--primary-color-hover: #1D4ED8 (Blue-700)
--secondary-color: #6B7280 (Gray-500)
--background-color: #F3F4F6 (Gray-100)
--surface-color: #FFFFFF (Blanco)
--border-color: #E5E7EB (Gray-200)
--text-primary: #111827 (Gray-900)
--text-secondary: #4B5563 (Gray-600)

Estados:
--status-completed-bg: #D1FAE5 (Green-100)
--status-completed-text: #065F46 (Green-800)
--status-processing-bg: #DBEAFE (Blue-100)
--status-processing-text: #1E40AF (Blue-800)
--status-present-icon: #16A34A (Green-600)
--status-missing-icon: #DC2626 (Red-600)
```

### Tipografía
- Fuente: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)
- Tamaños:
  - H1: 1.5rem (login)
  - H2: 1.75rem (dashboard)
  - H3: 1.25rem (modales), 1.1rem (paneles)
  - Body: 1rem
  - Small: 0.875rem, 0.75rem

### Espaciado
- Sistema basado en múltiplos de 4px:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px

### Bordes y Sombras
- Border radius: 4px (sm), 8px (md), 16px (lg)
- Box shadow: Sombra suave para tarjetas, sombra más pronunciada para modales

### Iconos
- SVG inline para logo y todos los iconos
- Tamaño estándar: 16px, 24px, 32px según contexto

---

## 📱 REQUISITOS DE DISEÑO RESPONSIVE

### Breakpoints y Comportamiento

#### Desktop (≥900px)
- Dashboard: Grid de 3 columnas (auto-fill, min 300px)
- Vista de Proyecto: Dos paneles lado a lado (flexbox)
  - Panel izquierdo (checklist): 40% del ancho
  - Panel derecho (chat): 60% del ancho
- Header: Altura fija 64px
- Contenedores: Max-width 1200px (dashboard) y 1400px (proyecto)

#### Tablet (600px - 899px)
- Dashboard: Grid de 2 columnas
- Vista de Proyecto: Paneles apilados verticalmente
  - Cada panel ocupa 100% del ancho
  - Altura máxima de 60vh por panel
  - Panel de chat con altura mínima de 400px
- Modal: Ancho 90% con max-width 500px

#### Mobile (<600px)
- Dashboard: Grid de 1 columna
- Vista de Proyecto: Paneles apilados verticalmente
  - Altura máxima de 50vh por panel
  - Scroll independiente en cada panel
- Modal: Ancho 95% del viewport
- Header: Padding reducido
- Botones: Tamaño táctil mínimo 44x44px
- Texto: Tamaños ajustados para legibilidad

### Reglas Responsive Específicas

```css
/* Ejemplo de media queries necesarias */

/* Tablet y Mobile */
@media (max-width: 900px) {
    .project-container {
        flex-direction: column;
        height: auto;
    }
    .checklist-panel, .chat-panel {
        flex: none;
        width: 100%;
        max-height: 60vh;
    }
}

/* Mobile */
@media (max-width: 600px) {
    .dashboard-container {
        padding: var(--spacing-md);
    }
    .projects-grid {
        grid-template-columns: 1fr;
    }
    .modal {
        width: 95%;
    }
    .main-header {
        padding: 0 var(--spacing-md);
    }
}
```

### Consideraciones de UX Responsive
1. **Touch Targets**: Todos los elementos interactivos deben tener al menos 44x44px
2. **Scroll**: Paneles con scroll independiente cuando el contenido excede el viewport
3. **Modal**: Se adapta al ancho disponible, centrado vertical y horizontalmente
4. **Formularios**: Inputs de ancho completo en mobile
5. **Navegación**: Breadcrumbs y botones de navegación accesibles en todos los tamaños

---

## 💾 ESTRUCTURA DE DATOS

### Mock Projects (Dashboard)
```javascript
[
    {
        id: 'proj-123',
        name: 'Boeing 787-9 Pre-Lease Audit',
        status: 'Completed',
        lastUpdated: '2 days ago'
    },
    // ... más proyectos
]
```

### Mock Checklist Data (Vista de Proyecto)
```javascript
{
    name: 'AIRCRAFT VH-ABC',
    type: 'Aircraft',
    icaoRef: '8.3.1',
    status: 'Present' | 'Missing',
    children: [
        {
            name: 'A. Valid Certificates',
            type: 'Folder' | 'File' | 'Engine' | 'Landing Gear' | 'APU',
            status: 'Present' | 'Missing',
            icaoRef: '8.3.2',
            children: [] // Array recursivo para estructura jerárquica
        },
        // ... más ítems
    ]
}
```

---

## 🔧 FUNCIONALIDADES TÉCNICAS DETALLADAS

### 1. Protección de Rutas (`main.js`)
- Verifica autenticación en páginas protegidas
- Redirige a login si no está autenticado
- Usa `sessionStorage.getItem('isAuthenticated')`

### 2. Sistema de Toasts (`main.js`)
- Función global `window.showToast(message, type)`
- Tipos: 'info', 'success', 'error'
- Animación de slide-in desde la derecha
- Auto-eliminación después de 4 segundos

### 3. Gestión de Modal (`dashboard.js`)
- Backdrop semitransparente
- Animación de escala y fade
- Cierre al hacer clic en backdrop, botón X, o botón Cancel
- Reset completo del estado al cerrar

### 4. Drag & Drop (`dashboard.js`)
- Zona de drop con feedback visual (cambio de color y fondo)
- Validación de tipo de archivo (.zip, .rar)
- Click para abrir selector de archivos
- Barra de progreso simulada (0-100% en intervalos)

### 5. Checklist Interactivo (`project.js`)
- Renderizado recursivo de estructura jerárquica
- Expandir/colapsar con animación
- Accordion para detalles de cada ítem
- Scroll automático al expandir ítems largos
- Iconos SVG dinámicos según estado

### 6. Chatbot Simulado (`project.js`)
- Historial de conversación en array
- Indicador de "pensando" con animación de puntos
- Respuestas predefinidas basadas en palabras clave
- Scroll automático al nuevo mensaje
- Formato diferenciado para mensajes de usuario vs IA

---

## 📝 INSTRUCCIONES PASO A PASO PARA RECREAR

### Paso 1: Estructura Base
1. Crear la estructura de carpetas: `css/` y `js/`
2. Crear los 3 archivos HTML principales
3. En cada HTML, incluir:
   - Meta viewport para responsive: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - Enlaces a CSS correspondientes
   - Scripts en orden: `mock-data.js`, `main.js`, `auth.js`, y el específico de la página

### Paso 2: CSS Global (`main.css`)
1. Definir todas las variables CSS en `:root`
2. Reset básico (box-sizing, margin, padding)
3. Estilos de tipografía
4. Clases utilitarias (.btn, .status-badge)
5. Estilos del header
6. Sistema de toasts con animaciones

### Paso 3: Página de Login (`1_login.html` + `login.css`)
1. Contenedor centrado con flexbox
2. Card con logo SVG, título, descripción
3. Botón de Google con icono SVG
4. Conectar con `auth.js` para manejar el click

### Paso 4: Dashboard (`2_dashboard.html` + `dashboard.css`)
1. Header con logo y botón logout
2. Sección de header con título y botón "Create New Project"
3. Grid de proyectos (CSS Grid con auto-fill)
4. Modal completo con:
   - Backdrop
   - Formulario con input de nombre
   - Drop zone con drag & drop
   - Barra de progreso
   - Botones de acción
5. Implementar lógica en `dashboard.js`:
   - Cargar y renderizar proyectos
   - Abrir/cerrar modal
   - Manejar drag & drop
   - Simular upload con progreso
   - Crear nuevo proyecto

### Paso 5: Vista de Proyecto (`3_project.html` + `project.css`)
1. Header con breadcrumbs
2. Contenedor flex con dos paneles
3. Panel izquierdo (checklist):
   - Header del panel
   - Área scrollable
   - Renderizado recursivo de checklist
4. Panel derecho (chat):
   - Header del panel
   - Ventana de mensajes scrollable
   - Área de input con formulario
5. Implementar lógica en `project.js`:
   - Obtener ID de proyecto de URL
   - Renderizar checklist recursivamente
   - Manejar expand/collapse
   - Sistema de chat con respuestas simuladas

### Paso 6: Datos Mock (`mock-data.js`)
1. Array de proyectos de ejemplo
2. Objeto de checklist jerárquico completo
3. Exponer en `window` para acceso global

### Paso 7: Utilidades (`main.js`)
1. Función de protección de rutas
2. Función global de toasts
3. Inicialización de protección al cargar

### Paso 8: Autenticación (`auth.js`)
1. Función de login (simulada)
2. Función de logout
3. Event listeners para botones

### Paso 9: Diseño Responsive
1. **Desktop**: Layouts originales
2. **Tablet (≤900px)**:
   - Vista de proyecto: cambiar flex-direction a column
   - Ajustar alturas de paneles
3. **Mobile (≤600px)**:
   - Grid de proyectos a 1 columna
   - Modales más anchos
   - Padding reducido
   - Asegurar touch targets de 44px mínimo

### Paso 10: Detalles y Pulido
1. Animaciones suaves en todas las transiciones
2. Estados hover en elementos interactivos
3. Feedback visual en drag & drop
4. Indicadores de carga
5. Validaciones de formulario
6. Manejo de errores básico
7. Accesibilidad: aria-labels, focus states

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### Autenticación
- [ ] Login simulado con Google
- [ ] Logout funcional
- [ ] Protección de rutas
- [ ] Redirección automática

### Dashboard
- [ ] Lista de proyectos en grid
- [ ] Crear nuevo proyecto
- [ ] Modal funcional
- [ ] Drag & drop de archivos
- [ ] Validación de tipo de archivo
- [ ] Barra de progreso de upload
- [ ] Estados visuales (Completed/Processing)
- [ ] Navegación a vista de proyecto

### Vista de Proyecto
- [ ] Checklist jerárquico renderizado
- [ ] Expandir/colapsar ítems
- [ ] Accordion de detalles
- [ ] Iconos de estado (Present/Missing)
- [ ] Chat funcional
- [ ] Indicador de "pensando"
- [ ] Scroll automático en chat
- [ ] Breadcrumbs navegables

### Responsive
- [ ] Desktop layout (≥900px)
- [ ] Tablet layout (600-899px)
- [ ] Mobile layout (<600px)
- [ ] Touch targets adecuados
- [ ] Modales adaptativos
- [ ] Grid responsive
- [ ] Paneles apilados en mobile

### UX/UI
- [ ] Toasts funcionales
- [ ] Animaciones suaves
- [ ] Estados hover
- [ ] Feedback visual
- [ ] Loading states
- [ ] Validaciones

---

## 🎯 PUNTOS CRÍTICOS A CONSIDERAR

1. **Responsive es OBLIGATORIO**: El diseño debe funcionar perfectamente en desktop, tablet y mobile
2. **Estructura Jerárquica**: El checklist debe renderizarse recursivamente para manejar cualquier nivel de anidación
3. **Estados Visuales**: Los estados (Present/Missing, Completed/Processing) deben ser claramente distinguibles
4. **Accesibilidad**: Incluir aria-labels, focus states, y navegación por teclado
5. **Performance**: Usar requestAnimationFrame para animaciones y scroll suave
6. **Validaciones**: Validar tipos de archivo, campos requeridos, y estados antes de acciones

---

## 📌 NOTAS ADICIONALES

- El proyecto usa **JavaScript Vanilla** sin dependencias externas
- La autenticación es **simulada** (no hay backend real)
- Los datos son **mock data** almacenados en `mock-data.js`
- El chatbot tiene **respuestas predefinidas** (no hay IA real integrada)
- El upload es **simulado** con una barra de progreso
- El procesamiento de documentos es **simulado** (no hay procesamiento real)

---

## 🚀 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

1. HTML básico de las 3 páginas
2. CSS global (variables, reset, utilidades)
3. CSS específico de cada página
4. JavaScript de utilidades (main.js)
5. Autenticación (auth.js)
6. Datos mock (mock-data.js)
7. Dashboard completo
8. Vista de proyecto completa
9. Responsive design
10. Pulido y animaciones

---

**IMPORTANTE**: Asegúrate de que el diseño sea completamente responsive y optimizado para todos los dispositivos (desktop, tablet, móvil). Esto es un requisito crítico del proyecto.

