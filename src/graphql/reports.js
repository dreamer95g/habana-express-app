import { gql } from '@apollo/client';


export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      exchangeRate
      activeProductsCount
      totalItemsSold
    }
  }
`;

// 👇 NUEVA QUERY PARA GRÁFICOS ADMIN
export const GET_ADMIN_DASHBOARD = gql`
  query GetAdminDashboard {
    annualReport {
      year
      totalNetProfit
      breakdown {
        month
        investment      # Costo Total
        profit          # Ganancia Neta
        roiPercentage   # ROI %
      }
    }
    topSellers(period: "year") {
      id_user
      name
      photo_url
      total_sales_usd
      items_sold
    }
  }
`;