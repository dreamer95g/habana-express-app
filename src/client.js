import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 1. Configuración del enlace HTTP (Dinámico)
const apiUrl = import.meta.env.VITE_API_URL;

const httpLink = createHttpLink({
  uri: `${apiUrl}/graphql`, // Se conecta a /graphql
});

// 2. Middleware de Autenticación
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// 3. Inicialización del Cliente
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});