import { gql } from '@apollo/client';

export const HEALTH_QUERY = gql`
  query HealthCheck {
    health {
      status
      uptime
      timestamp
      environment
    }
  }
`;

export const ME_QUERY = gql`
  query GetCurrentUser {
    me {
      id
      name
      email
      username
      image
      bio
      coverImage
      phone
      role
      emailVerified
      preferences {
        id
        theme
        locale
        defaultPostAudience
        highQualityUploads
        hdrVideo
        autoplay
        dataSaver
      }
    }
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    authorId
    postType
    status
    audience
    caption
    title
    image
    images
    ingredients
    instructions
    preparationTime
    servings
    cuisine
    categories
    originalPostId
    likeCount
    commentCount
    repostCount
    hasLiked
    isCommentDisabled
    daysRemaining
    deletedAt
    createdAt
    updatedAt
    author {
      id
      name
      email
      image
      role
      bio
    }
    group {
      id
      name
      slug
      avatar
      privacy
    }
    originalPost {
      id
      authorId
      postType
      caption
      title
      image
      images
      cuisine
      preparationTime
      servings
      ingredients
      instructions
      isCommentDisabled
      createdAt
      author {
        id
        name
        email
        image
        role
        bio
      }
    }
  }
`;

export const FEED_QUERY = gql`
  ${POST_FRAGMENT}
  query GetFeed(
    $first: Int
    $after: String
    $type: String
    $cuisine: String
    $search: String
    $authorId: ID
    $groupId: ID
    $filter: String
  ) {
    feed(
      first: $first
      after: $after
      type: $type
      cuisine: $cuisine
      search: $search
      authorId: $authorId
      groupId: $groupId
      filter: $filter
    ) {
      edges {
        cursor
        node {
          ...PostFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const POST_QUERY = gql`
  ${POST_FRAGMENT}
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
      comments {
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
  }
`;

export const TRASH_QUERY = gql`
  ${POST_FRAGMENT}
  query GetTrash($first: Int, $after: String) {
    trash(first: $first, after: $after) {
      edges {
        cursor
        node {
          ...PostFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const USER_PROFILE_QUERY = gql`
  query GetUserProfile($id: ID, $username: String) {
    userProfile(id: $id, username: $username) {
      id
      name
      email
      username
      image
      bio
      coverImage
      phone
      role
      city
      work
      education
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
      recipesCount
      postsCount
      followersCount
      followingCount
      friendsCount
      createdGroupsCount
      isFollowing
      isMe
      twoFactorEnabled
      emailOtpEnabled
      totpEnabled
      createdAt
      preferences {
        id
        theme
        locale
        timezone
        defaultPostAudience
        highQualityUploads
        hdrVideo
        autoplay
        dataSaver
        stepGalleryFullscreen
        showNutritionOverlay
      }
    }
  }
`;

export const USER_PREFERENCES_QUERY = gql`
  query GetUserPreferences {
    userPreferences {
      id
      theme
      locale
      timezone
      defaultPostAudience
      friendRequestPolicy
      messagePolicy
      twoFactorEnabled
      highQualityUploads
      hdrVideo
      autoplay
      dataSaver
      stepGalleryFullscreen
      showNutritionOverlay
      version
    }
  }
`;

export const FRIENDS_QUERY = gql`
  query GetFriends($userId: ID, $search: String) {
    friends(userId: $userId, search: $search) {
      id
      name
      email
      image
      bio
      mutualCount
    }
  }
`;

export const FRIEND_REQUESTS_QUERY = gql`
  query GetFriendRequests {
    friendRequests {
      id
      senderId
      receiverId
      status
      mutualFriendsCount
      createdAt
      sender {
        id
        name
        image
        username
        city
        bio
      }
    }
  }
`;

export const BLOCKED_USERS_QUERY = gql`
  query GetBlockedUsers {
    blockedUsers {
      id
      name
      username
      image
      blockedAt
    }
  }
`;

export const RELATIONSHIP_STATUS_QUERY = gql`
  query GetRelationshipStatus($targetUserId: ID!) {
    relationshipStatus(targetUserId: $targetUserId) {
      status
      requestId
      friendsCount
      mutualCount
      mutualSample {
        id
        name
        image
      }
    }
  }
`;

export const GROUPS_QUERY = gql`
  query GetGroups($search: String, $myGroups: Boolean) {
    groups(search: $search, myGroups: $myGroups) {
      id
      name
      slug
      description
      coverImage
      avatar
      privacy
      requiresPostApproval
      createdById
      membersCount
      postsCount
      isMember
      currentUserRole
      createdAt
    }
  }
`;

export const GROUP_QUERY = gql`
  query GetGroupBySlug($slug: String!) {
    group(slug: $slug) {
      id
      name
      slug
      description
      coverImage
      avatar
      privacy
      requiresPostApproval
      createdById
      membersCount
      postsCount
      isMember
      currentUserRole
      createdAt
      members {
        id
        userId
        role
        isApproved
        user {
          id
          name
          image
        }
      }
    }
  }
`;
