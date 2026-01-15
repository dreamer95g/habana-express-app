import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 1. Configuración del enlace HTTP (Tu Backend)
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// 2. Middleware de Autenticación
const authLink = setContext((_, { headers }) => {
  // Obtener el token del almacenamiento local de manera segura
  const token = localStorage.getItem('token');
  
  // Retornar los headers con el token adjunto si existe
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
      fetchPolicy: 'network-only', // Evita caché agresiva en desarrollo
    },
  },
});