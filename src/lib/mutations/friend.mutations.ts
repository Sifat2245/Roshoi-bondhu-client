import { gql } from '@apollo/client';

export const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($receiverId: ID!) {
    sendFriendRequest(receiverId: $receiverId) {
      success
      status
      message
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  mutation AcceptFriendRequest($requestId: ID!) {
    acceptFriendRequest(requestId: $requestId)
  }
`;

export const DECLINE_FRIEND_REQUEST_MUTATION = gql`
  mutation DeclineFriendRequest($requestId: ID!) {
    declineFriendRequest(requestId: $requestId)
  }
`;

export const CANCEL_FRIEND_REQUEST_MUTATION = gql`
  mutation CancelFriendRequest($receiverId: ID!) {
    cancelFriendRequest(receiverId: $receiverId)
  }
`;

export const UNFRIEND_MUTATION = gql`
  mutation Unfriend($friendId: ID!) {
    unfriend(friendId: $friendId)
  }
`;

