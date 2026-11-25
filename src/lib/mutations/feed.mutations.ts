import { gql } from '@apollo/client';

export const HIDE_POST_MUTATION = gql`
  mutation HidePost($postId: ID!) {
    hidePost(postId: $postId)
  }
`;

export const UNHIDE_POST_MUTATION = gql`
  mutation UnhidePost($postId: ID!) {
    unhidePost(postId: $postId)
  }
`;

