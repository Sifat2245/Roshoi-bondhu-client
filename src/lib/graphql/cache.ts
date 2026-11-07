import { InMemoryCache } from '@apollo/client';

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {},
    },
    UserProfile: {
      keyFields: ['id'],
    },
    Post: {
      keyFields: ['id'],
    },
    Group: {
      keyFields: ['id'],
    },
  },
});

export default cache;

