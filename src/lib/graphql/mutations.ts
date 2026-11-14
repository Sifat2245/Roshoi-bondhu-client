import { gql } from '@apollo/client';
import { POST_FRAGMENT } from './queries';

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

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: ID!, $content: String!, $parentId: ID) {
    createComment(postId: $postId, content: $content, parentId: $parentId) {
      id
      postId
      userId
      content
      createdAt
      updatedAt
      user {
        id
        name
        image
      }
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
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

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      username
      bio
      image
      coverImage
      city
      work
      education
      phone
      gender
      birthDate
      hometown
      languages
      expertise
      hobbies
      interests
      website
      socialLinks
      contactVisibility
      birthdayVisibility
    }
  }
`;

export const UPDATE_PREFERENCES_MUTATION = gql`
  mutation UpdatePreferences($input: UpdatePreferencesInput!) {
    updatePreferences(input: $input) {
      id
      theme
      locale
      timezone
      defaultPostAudience
      friendRequestPolicy
      messagePolicy
      highQualityUploads
      hdrVideo
      autoplay
      dataSaver
      stepGalleryFullscreen
      showNutritionOverlay
    }
  }
`;

export const TOGGLE_FOLLOW_MUTATION = gql`
  mutation ToggleFollow($targetUserId: ID!) {
    toggleFollow(targetUserId: $targetUserId) {
      isFollowing
      followersCount
    }
  }
`;

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

export const BLOCK_USER_MUTATION = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId)
  }
`;

export const UNBLOCK_USER_MUTATION = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId)
  }
`;

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($name: String!, $description: String, $privacy: String) {
    createGroup(name: $name, description: $description, privacy: $privacy) {
      id
      name
      slug
      description
      privacy
    }
  }
`;

export const JOIN_GROUP_MUTATION = gql`
  mutation JoinGroup($groupId: ID!) {
    joinGroup(groupId: $groupId)
  }
`;

export const LEAVE_GROUP_MUTATION = gql`
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

