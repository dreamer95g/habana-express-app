// src/graphql/users.js
import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id_user
      name
      phone
      email
      role
      active
      photo_url
      telegram_chat_id
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id_user
      name
      phone
      email
      role
      photo_url
      telegram_chat_id
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id_user
      name
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id_user: Int!, $input: UpdateUserInput!) {
    updateUser(id_user: $id_user, input: $input) {
      id_user
      name
      role
      photo_url
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id_user: Int!) {
    deleteUser(id_user: $id_user) {
      id_user
      active
    }
  }
`;