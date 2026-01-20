import { gql } from '@apollo/client';



export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id_product
      name
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id_product: Int!, $input: UpdateProductInput!) {
    updateProduct(id_product: $id_product, input: $input) {
      id_product
      name
      stock
      active
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($active: Boolean) {
    products(active: $active) {
      id_product
      name
      description
      purchase_price
      sale_price
      stock
      sku
      
      supplier_name  # 👈 ¡AGREGA ESTA LÍNEA!
      
      photo_url
      warranty
      active
      product_categories {
        category {
          id_category
          name
        }
      }
    }
  }
`;



export const ASSIGN_PRODUCT = gql`
  mutation AssignProductToSeller($sellerId: Int!, $productId: Int!, $quantity: Int!) {
    assignProductToSeller(sellerId: $sellerId, productId: $productId, quantity: $quantity) {
      id_seller_product
      quantity
      seller {
        name
      }
    }
  }
`;

// Obtener productos específicos asignados a un vendedor
export const GET_SELLER_PRODUCTS = gql`
  query GetSellerProducts($sellerId: Int!) {
    sellerProducts(sellerId: $sellerId) {
      id_seller_product
      quantity
      assigned_at
      product {
        id_product
        name
        photo_url
        sale_price
        stock # Stock global para referencia
      }
    }
  }
`;

// Devolver producto del vendedor al almacén
export const RETURN_PRODUCT_FROM_SELLER = gql`
  mutation ReturnProductFromSeller($sellerId: Int!, $productId: Int!, $quantity: Int!) {
    returnProductFromSeller(sellerId: $sellerId, productId: $productId, quantity: $quantity) {
      id_seller_product
      quantity
    }
  }
`;