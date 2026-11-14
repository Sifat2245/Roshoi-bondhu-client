import { InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        feed: relayStylePagination(['type', 'cuisine', 'search', 'authorId', 'groupId', 'filter']),
        trash: relayStylePagination(),
      },
    },
    Post: {
      keyFields: ['id'],
    },
    PostComment: {
      keyFields: ['id'],
    },
    UserProfile: {
      keyFields: ['id'],
    },
    UserPreferences: {
      keyFields: ['id'],
    },
  },
});

export default cache;
