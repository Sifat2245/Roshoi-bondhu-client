import { HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { API_BASE_URL } from '../env';

export const GRAPHQL_URI = `${API_BASE_URL}/graphql`;

export const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
  credentials: 'include', // Ensures Better Auth session cookies are transmitted
});

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.warn(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${JSON.stringify(path)}, Code: ${extensions?.code}`
      );
    });
  }

  if (networkError) {
    console.error(`[GraphQL Network error]: ${networkError.message}`);
  }
});

export const appLink = from([errorLink, httpLink]);

