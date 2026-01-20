<div align="center">

  <h1>🚀 Habana Express APP</h1>
  <h3>Productos Internacionales al alcance de tu mano en un buen precio</h3>
<div align="center">

  <h1>🚀 Habana Express - Dashboard & POS</h1>
  <h3>Sistema de Gestión de Inventario y Ventas para Retail en Cuba</h3>

  <p>
    <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-Fast-yellow?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/GraphQL-Apollo-E10098?style=for-the-badge&logo=graphql" alt="GraphQL" />
  </p>

  <p>
    <b>Frontend administrativo y operativo.</b><br>
    Gestiona inventario global, asignaciones a vendedores en consignación,<br>
    y punto de venta (POS) con doble moneda (CUP/USD).
  </p>

</div>

<hr />

## 📋 Descripción del Proyecto

**Habana Express App** es la interfaz de usuario para el ecosistema comercial de Habana Express. Está diseñada para resolver la complejidad del comercio en Cuba, permitiendo la gestión de precios dinámicos basados en la tasa de cambio diaria y un control estricto del stock en manos de vendedores.

### 🌟 Características Principales

*   **🛒 Punto de Venta (POS):** Interfaz optimizada para vendedores. Muestra solo el stock asignado, calcula precios en tiempo real según la tasa del día y muestra la ganancia estimada (comisión) por venta.
*   **📦 Inventario Dual:** Gestión de **Stock Global** (Almacén Central) vs **Stock Asignado** (En manos del vendedor).
*   **👥 Gestión de Roles:**
    *   **Admin:** Control total, reportes, gestión de usuarios, historial de ventas y configuración.
    *   **Storekeeper (Almacenero):** Recepción de envíos, creación de productos y asignación de mercancía a vendedores.
    *   **Seller (Vendedor):** Acceso exclusivo al POS para vender su mercancía asignada.
*   **💱 Tasa de Cambio Dinámica:** Sincronización automática o manual de la tasa del dólar, actualizando precios de venta masivamente.
*   **📉 Gestión de Devoluciones:** Flujo para retornar mercancía del vendedor al almacén principal.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto fue construido con las mejores prácticas de desarrollo moderno:

*   **Core:** React 18 + Vite (Build Tool).
*   **Estilos:** TailwindCSS (Utility-first CSS).
*   **Estado & Datos:** Apollo Client (Gestión de Estado y Caching de GraphQL).
*   **Formularios:** React Hook Form (Validación y performance).
*   **Rutas:** React Router DOM v6.
*   **UI Components:** Lucide React (Iconografía), React Hot Toast (Notificaciones).

---

## 🚀 Instalación y Puesta en Marcha

Sigue estos pasos para levantar el proyecto en tu entorno local.

### Prerrequisitos
*   Node.js (v18 o superior recomendado).
*   Tener el **Backend (API)** corriendo en el puerto `4000`.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/habana-express-app.git
cd habana-express-app

2. Instalar dependencias

npm install

3. Configuración de Entorno
Crea un archivo .env en la raíz del proyecto (si no existe) y configura la URL de la API:
VITE_API_URL=http://localhost:4000

4. Ejecutar en Desarrollo

npm run dev

📂 Estructura del Proyecto
src/
├── components/        # Componentes reutilizables
│   ├── layout/        # Navbar, Sidebar, Layout principal
│   ├── products/      # Tarjetas, Modales de Edición/Asignación
│   ├── sales/         # Modales de Ventas
│   ├── ui/            # Elementos genéricos (ImageDropzone, etc.)
│   └── users/         # Gestión de usuarios
├── context/           # Contexto global (AuthContext)
├── graphql/           # Definiciones de Queries y Mutations
├── pages/             # Vistas principales (Rutas)
│   ├── Dashboard.jsx  # Panel de resumen
│   ├── Inventory.jsx  # Gestión de productos
│   ├── POS.jsx        # Punto de Venta (Vendedores)
│   ├── Sales.jsx      # Historial de Ventas (Admin)
│   └── ...
├── client.js          # Configuración de Apollo Client
├── main.jsx           # Punto de entrada
└── App.jsx            # Configuración de Rutas


🔐 Flujo de Trabajo (Lógica de Negocio)
1. Ciclo de Inventario
Storekeeper crea un producto -> Stock entra al Almacén Global.
Storekeeper asigna 5 unidades al Vendedor A.
Stock Global: No cambia (es el total físico).
Stock Vendedor A: Aumenta a 5.
Vendedor A vende 1 unidad desde el POS.
Stock Global: Disminuye en 1.
Stock Vendedor A: Disminuye en 1.
2. Ciclo de Precios
El precio base se define en USD (Costo).
El sistema calcula el precio de venta en CUP usando la fórmula: Costo * 2 * Tasa_Diaria.
Si la tasa cambia en Configuración, todos los precios en CUP se actualizan al instante en el POS.
🤝 Contribución
Las Pull Requests son bienvenidas. Para cambios importantes, por favor abre primero un issue para discutir lo que te gustaría cambiar.

<div align="center">
<small>Desarrollado para <b>Habana Express Store</b> © 2026</small>
</div>