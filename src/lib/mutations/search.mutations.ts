import { gql } from '@apollo/client';

export const SAVE_RECENT_SEARCH_MUTATION = gql`
  mutation SaveRecentSearch($query: String!, $targetType: SearchTargetType!, $targetId: String) {
    saveRecentSearch(query: $query, targetType: $targetType, targetId: $targetId) {
      id
      query
      targetType
      targetId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_RECENT_SEARCH_MUTATION = gql`
  mutation RemoveRecentSearch($id: ID!) {
    removeRecentSearch(id: $id)
  }
`;

export const CLEAR_RECENT_SEARCHES_MUTATION = gql`
  mutation ClearRecentSearches {
    clearRecentSearches
  }
`;

