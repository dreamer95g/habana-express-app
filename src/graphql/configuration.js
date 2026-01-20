import { gql } from '@apollo/client';

export const GET_CONFIG = gql`
  query GetSystemConfiguration {
    systemConfiguration {
      id_config
      company_name
      company_phone
      company_email
      logo_url  # <--- NUEVO CAMPO
      description
      seller_commission_percentage
      default_exchange_rate
      telegram_bot_token
      active
      exchange_rate_sync_time
      monthly_report_day
      monthly_report_time
      annual_report_day
      annual_report_time
    }
  }
`;

export const UPDATE_CONFIG = gql`
  mutation UpdateSystemConfiguration($id_config: Int!, $input: UpdateSystemConfigurationInput!) {
    updateSystemConfiguration(id_config: $id_config, input: $input) {
      id_config
      company_name
    }
  }
`;

export const TRIGGER_SYNC = gql`
  mutation TriggerPriceSync {
    triggerPriceSync
  }
`;