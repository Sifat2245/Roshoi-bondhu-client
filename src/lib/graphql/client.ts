import { ApolloClient } from '@apollo/client';
import { cache } from './cache';
import { appLink } from './links';

export const apolloClient = new ApolloClient({
  link: appLink,
  cache,
  connectToDevTools: import.meta.env.DEV,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;

