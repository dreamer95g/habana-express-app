import { gql } from '@apollo/client';

export const GET_SHIPMENTS = gql`
  query GetShipments {
    shipments {
      id_shipment
      agency_name
      shipment_date
      shipping_cost_usd
      merchandise_cost_usd
      customs_fee_cup
      exchange_rate
      notes
    }
  }
`;

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment(
    $agency_name: String!, 
    $shipment_date: String!, 
    $shipping_cost_usd: Float!, 
    $merchandise_cost_usd: Float!, 
    $customs_fee_cup: Float!, 
    $exchange_rate: Float!, 
    $notes: String
  ) {
    createShipment(
      agency_name: $agency_name, 
      shipment_date: $shipment_date, 
      shipping_cost_usd: $shipping_cost_usd, 
      merchandise_cost_usd: $merchandise_cost_usd, 
      customs_fee_cup: $customs_fee_cup, 
      exchange_rate: $exchange_rate, 
      notes: $notes
    ) {
      id_shipment
      agency_name
    }
  }
`;
export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($id_shipment: Int!, $input: UpdateShipmentInput!) {
    updateShipment(id_shipment: $id_shipment, input: $input) {
      id_shipment
      agency_name
      shipment_date
      shipping_cost_usd
      merchandise_cost_usd
      customs_fee_cup
      exchange_rate
      notes
    }
  }
`;

export const DELETE_SHIPMENT = gql`
  mutation DeleteShipment($id_shipment: Int!) {
    deleteShipment(id_shipment: $id_shipment) {
      id_shipment
    }
  }
`;