import { gql } from '@apollo/client';

export const CREATE_SALE = gql`
  mutation CreateSale(
    $sellerId: Int!,
    $exchange_rate: Float!,
    $total_cup: Float!,
    $buyer_phone: String!,
    $payment_method: PaymentMethod!,
    $notes: String,
    $items: [SaleItemInput!]!
  ) {
    createSale(
      sellerId: $sellerId,
      exchange_rate: $exchange_rate,
      total_cup: $total_cup,
      buyer_phone: $buyer_phone,
      payment_method: $payment_method,
      notes: $notes,
      items: $items
    ) {
      id_sale
      total_cup
    }
  }
`;

export const GET_SALES = gql`
  query GetSales {
    sales {
      id_sale
      sale_date
      total_cup
      buyer_phone
      payment_method
      exchange_rate
      status        # <--- ¡IMPORTANTE!
      notes
      seller { 
        id_user
        name 
      }
      sale_products {
        id_product  # <--- Necesario para devoluciones
        quantity
        product { 
            id_product
            name 
        }
      }
    }
  }
`;

export const UPDATE_SALE = gql`
  mutation UpdateSale($id_sale: Int!, $input: UpdateSaleInput!) {
    updateSale(id_sale: $id_sale, input: $input) {
      id_sale
      total_cup
    }
  }
`;

// ✅ CAMBIO DE NOMBRE: De DELETE_SALE a CANCEL_SALE
export const CANCEL_SALE = gql`
  mutation CancelSale($id_sale: Int!) {
    cancelSale(id_sale: $id_sale) {
      id_sale
      status
    }
  }
`;

// Ojo: Mantengo DELETE_SALE por si acaso tienes algún código viejo que lo llame, 
// pero deberías dejar de usarlo. Si no lo usas, bórralo.
export const DELETE_SALE = gql`
  mutation DeleteSale($id_sale: Int!) {
    deleteSale(id_sale: $id_sale) {
      id_sale
    }
  }
`;

// ✅ NUEVA PARA DEVOLUCIONES
export const CREATE_RETURN = gql`
  mutation CreateReturn($saleId: Int!, $productId: Int!, $quantity: Int!, $reason: String, $returnToStock: Boolean!) {
    createReturn(saleId: $saleId, productId: $productId, quantity: $quantity, reason: $reason, returnToStock: $returnToStock) {
      id_return
    }
  }
`;