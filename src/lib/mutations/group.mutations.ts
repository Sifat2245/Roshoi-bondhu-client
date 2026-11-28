import { gql } from '@apollo/client';

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($name: String!, $description: String, $privacy: String, $coverImage: String, $avatar: String, $invitedUserIds: [ID!]) {
    createGroup(name: $name, description: $description, privacy: $privacy, coverImage: $coverImage, avatar: $avatar, invitedUserIds: $invitedUserIds) {
      id
      name
      slug
      description
      coverImage
      avatar
      privacy
      createdById
      createdBy {
        id
        name
        image
      }
      membersCount
      isMember
      currentUserRole
      canModerate
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

export const UPDATE_GROUP_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateGroupMemberRole($groupId: ID!, $memberId: ID!, $role: String!) {
    updateGroupMemberRole(groupId: $groupId, memberId: $memberId, role: $role) {
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
`;

export const REMOVE_GROUP_MEMBER_MUTATION = gql`
  mutation RemoveGroupMember($groupId: ID!, $memberId: ID!) {
    removeGroupMember(groupId: $groupId, memberId: $memberId)
  }
`;

export const ADD_GROUP_MEMBER_MUTATION = gql`
  mutation AddGroupMember($groupId: ID!, $userId: ID!, $role: String) {
    addGroupMember(groupId: $groupId, userId: $userId, role: $role) {
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
`;

export const UPDATE_GROUP_COVER_MUTATION = gql`
  mutation UpdateGroupCover($groupId: ID!, $coverImage: String!) {
    updateGroupCover(groupId: $groupId, coverImage: $coverImage) {
      id
      slug
      coverImage
    }
  }
`;

export const UPDATE_GROUP_SETTINGS_MUTATION = gql`
  mutation UpdateGroupSettings($groupId: ID!, $input: UpdateGroupSettingsInput!) {
    updateGroupSettings(groupId: $groupId, input: $input) {
      id
      name
      slug
      description
      coverImage
      avatar
      privacy
      discoverability
      status
      requiresPostApproval
      challengeCreatorPolicy
      version
      archivedAt
      ownerId
      owner {
        id
        name
        image
      }
      createdById
      membersCount
      postsCount
      isMember
      currentUserRole
      canModerate
      pendingRequestsCount
      pendingPostsCount
    }
  }
`;

export const TRANSFER_GROUP_OWNERSHIP_MUTATION = gql`
  mutation TransferGroupOwnership($groupId: ID!, $newOwnerUserId: ID!) {
    transferGroupOwnership(groupId: $groupId, newOwnerUserId: $newOwnerUserId) {
      id
      slug
      ownerId
      owner {
        id
        name
        image
      }
      currentUserRole
      canModerate
      version
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

export const UPDATE_GROUP_LIFECYCLE_MUTATION = gql`
  mutation UpdateGroupLifecycle($groupId: ID!, $action: String!) {
    updateGroupLifecycle(groupId: $groupId, action: $action) {
      id
      slug
      status
      archivedAt
      version
    }
  }
`;

