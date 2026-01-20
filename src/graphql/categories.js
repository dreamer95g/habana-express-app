// src/graphql/categories.js
import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id_category
      name
      active
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id_category
      name
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id_category: Int!, $name: String!) {
    updateCategory(id_category: $id_category, name: $name) {
      id_category
      name
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id_category: Int!) {
    deleteCategory(id_category: $id_category) {
      id_category
      active
    }
  }
`;