import { gql } from '@apollo/client';
import { POST_FRAGMENT } from '../graphql/queries';

export const CREATE_POST_MUTATION = gql`
  ${POST_FRAGMENT}
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostFields
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  ${POST_FRAGMENT}
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      ...PostFields
    }
  }
`;

export const REPOST_MUTATION = gql`
  ${POST_FRAGMENT}
  mutation RepostPost($originalPostId: ID!, $caption: String, $audience: PostAudience) {
    repostPost(originalPostId: $originalPostId, caption: $caption, audience: $audience) {
      ...PostFields
    }
  }
`;

export const TOGGLE_LIKE_MUTATION = gql`
  mutation ToggleLike($postId: ID!) {
    toggleLike(postId: $postId) {
      liked
      likeCount
    }
  }
`;

export const TOGGLE_COMMENT_LIKE_MUTATION = gql`
  mutation ToggleCommentLike($commentId: ID!) {
    toggleCommentLike(commentId: $commentId) {
      liked
      likeCount
    }
  }
`;

export const TOGGLE_COMMENTS_DISABLED_MUTATION = gql`
  ${POST_FRAGMENT}
  mutation ToggleCommentsDisabled($postId: ID!) {
    toggleCommentsDisabled(postId: $postId) {
      ...PostFields
    }
  }
`;

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: ID!, $content: String!, $parentId: ID) {
    createComment(postId: $postId, content: $content, parentId: $parentId) {
      id
      postId
      userId
      parentId
      content
      likeCount
      hasLiked
      createdAt
      updatedAt
      user {
        id
        name
        image
      }
      replies {
        id
        postId
        userId
        content
        likeCount
        hasLiked
        createdAt
        updatedAt
        user {
          id
          name
          image
        }
      }
    }
  }
`;

export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      postId
      userId
      parentId
      content
      likeCount
      hasLiked
      createdAt
      updatedAt
      user {
        id
        name
        image
      }
      replies {
        id
        postId
        userId
        content
        likeCount
        hasLiked
        createdAt
        updatedAt
        user {
          id
          name
          image
        }
      }
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

export const POLL_FIELDS = gql`
  fragment PollFields on Poll {
    id
    postId
    authorId
    question
    multiple
    closed
    expiresAt
    totalVotes
    createdAt
    updatedAt
    options {
      id
      pollId
      text
      voteCount
      voterIds
      hasVoted
      voters {
        id
        name
        image
        role
      }
    }
  }
`;

export const VOTE_POLL_MUTATION = gql`
  ${POLL_FIELDS}
  mutation VotePoll($pollId: ID!, $optionId: ID!) {
    votePoll(pollId: $pollId, optionId: $optionId) {
      ...PollFields
    }
  }
`;

export const TOGGLE_POLL_STATUS_MUTATION = gql`
  ${POLL_FIELDS}
  mutation TogglePollStatus($pollId: ID!) {
    togglePollStatus(pollId: $pollId) {
      ...PollFields
    }
  }
`;

export const UPDATE_POLL_MUTATION = gql`
  ${POLL_FIELDS}
  mutation UpdatePoll($id: ID!, $input: UpdatePollInput!) {
    updatePoll(id: $id, input: $input) {
      ...PollFields
    }
  }
`;

export const DELETE_POLL_MUTATION = gql`
  mutation DeletePoll($id: ID!) {
    deletePoll(id: $id)
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId) {
      success
      id
    }
  }
`;

export const RESTORE_POST_MUTATION = gql`
  ${POST_FRAGMENT}
  mutation RestorePost($postId: ID!) {
    restorePost(postId: $postId) {
      ...PostFields
    }
  }
`;

export const PERMANENT_DELETE_POST_MUTATION = gql`
  mutation PermanentDeletePost($postId: ID!) {
    permanentDeletePost(postId: $postId) {
      success
      id
    }
  }
`;

export const EMPTY_TRASH_MUTATION = gql`
  mutation EmptyTrash {
    emptyTrash
  }
`;

