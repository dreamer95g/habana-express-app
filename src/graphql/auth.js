// src/graphql/auth.js
import { gql } from '@apollo/client';


export const LOGIN_MUTATION = gql`
  mutation Login($phone: String!, $password: String!) {
    login(phone: $phone, password: $password) {
      token
      user {
        id_user
        name
        role
        photo_url
        
        # ✅ AGREGAMOS ESTOS CAMPOS FALTANTES:
        phone
        email
        telegram_chat_id
      }
    }
  }
`;