<div align="center">

  <h1>🚀 Habana Express APP</h1>
  <h3>Productos Internacionales al alcance de tu mano en un buen precio</h3>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white" alt="NodeJS" />
    <img src="https://img.shields.io/badge/GraphQL-Apollo-E10098?style=flat-square&logo=graphql&logoColor=white" alt="GraphQL" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/MySQL-DB-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Telegram-Bot-26A5E4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram" />
  </p>

  <p>
    <b>Solución Backend integral para superar las barreras del comercio con doble moneda.</b>
    <br>
    <i>Gestión de inventario descentralizada, fijación de precios dinámica y reportes financieros automatizados.</i>
  </p>

</div>

<hr>

## 📋 Descripción del Proyecto

**Habana Express API** no es solo un gestor de inventario; es un motor financiero diseñado para el contexto cubano. El sistema automatiza la compleja relación entre el costo de importación (USD), la tasa de cambio fluctuante (CUP) y la gestión de vendedores comisionistas.

Su núcleo integra un **Bot de Telegram** que actúa como asistente administrativo, eliminando la necesidad de paneles webs complejos para la operación diaria.

---

## 💎 Características Clave

### 1. 💵 Finanzas & Doble Moneda
*   **Fijación de Precios Dinámica:** El sistema consulta diariamente APIs externas para obtener la tasa de cambio actual.
*   **Algoritmo de Precios:** Recalcula automáticamente el precio de venta en CUP de todo el inventario activo basándose en la fórmula: `Costo USD * 2 * Tasa del Día`.
*   **Cálculo de Ganancia Real:** Reportes que descuentan costos de envío, aranceles aduanales, pérdidas por devoluciones y comisiones de vendedores.

### 2. 📦 Logística & Inventario
*   **Inventario en Consignación:** Distinción entre **Stock Global** (Almacén) y **Stock Asignado** (Vendedor). Un vendedor solo puede vender lo que se le ha asignado.
*   **Stock Reactivo:**
    *   Si el stock llega a `0`, el producto se desactiva automáticamente.
    *   Notificación automática de "Liquidación de Lote" con análisis de rentabilidad final.

### 3. 🤖 Integración Profunda con Telegram
El sistema "habla" con los usuarios según su rol:
*   **Admin:** Recibe reportes financieros (ROI), alertas de stock agotado y resumen de ganancias netas por venta.
*   **Vendedores:** Reciben cada mañana su lista de precios actualizada según la tasa del día y notificaciones de sus comisiones ganadas.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Uso |
| :--- | :--- | :--- |
| **Server** | Node.js + Express | Servidor HTTP y manejo de archivos estáticos. |
| **API** | Apollo Server (GraphQL) | Endpoint único tipado para consultas y mutaciones. |
| **ORM** | Prisma | Modelado de datos y migraciones seguras a MySQL. |
| **Database** | MySQL | Almacenamiento relacional con soporte UTF8MB4. |
| **Automation** | Node-Cron + Axios | Scraping de tasas de cambio y tareas programadas. |
| **Bot** | Telegraf | Interfaz de chat para comandos y notificaciones push. |

---

## 📊 Lógica Financiera (Profit Formula)

El sistema prioriza la **transparencia financiera**. La ganancia neta no es una estimación, es un cálculo exacto:

Ganancia Neta = Ingresos Totales - (Costo Mercancía + Envíos + Aranceles + Pérdidas Devolución + Comisiones Vendedor)

Nota: El sistema aplica redondeos inteligentes a las decenas en la tasa de cambio (ej: 314 -> 310, 316 -> 320) para facilitar el manejo de efectivo en CUP.

🚀 Instalación y Despliegue
1. Requisitos Previos
Node.js v18+
MySQL Server corriendo localmente o en nube.
2. Clonar y Dependencias

git clone https://github.com/tu-usuario/habana-express-api.git
cd habana-express-api
npm install

3. Configuración de Entorno (.env)
Crea un archivo .env en la raíz:

DATABASE_URL="mysql://user:pass@localhost:3306/habana_express_store"
PORT=4000
JWT_SECRET="TU_SECRETO_SEGURO"

4. Base de Datos
Inicializa el esquema y carga los datos de prueba (Admin, Seller, Storekeeper):

npx prisma db push
node prisma/seed.js

5. Iniciar Servidor
# Modo Desarrollo (con nodemon)
npm run dev

# Modo Producción
npm start

Accede al Playground de GraphQL en: http://localhost:4000/graphql

🎮 Comandos del Bot (Telegram)
Una vez configurado el telegram_bot_token en la base de datos:
Comando	Descripción
/monthly	Genera el Estado de Resultados del Mes actual (Ingresos vs Gastos vs ROI).
/yearly	Genera el Reporte Anual con desglose mes a mes.
/help	Muestra la lista de comandos disponibles.

📡 Ejemplo de Uso (GraphQL)
Registrar una Venta

mutation {
  createSale(
    sellerId: 2,
    exchange_rate: 320.00,
    total_cup: 64000.00,
    buyer_phone: "55555555",
    payment_method: cash,
    items: [
      { productId: 1, quantity: 1 }
    ]
  ) {
    id_sale
    total_cup
    sale_products {
      product {
        name
      }
    }
  }
}

Consultar Reporte Financiero Anual
query {
  annualReport {
    year
    totalNetProfit
    breakdown {
      month
      investment
      profit
      roiPercentage
    }
  }
}

<div align="center">
<p>Desarrollado para <b>Habana Express Store</b></p>
<p>2026 &bull; Licencia ISC</p>
</div>