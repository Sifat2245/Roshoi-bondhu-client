import { gql, useQuery } from '@apollo/client';

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
      image
      bio
      coverImage
      role
    }
  }
`;

export interface HealthData {
  health: {
    status: string;
    uptime: number;
    timestamp: string;
    environment: string;
  };
}

export function useGraphQLHealth() {
  return useQuery<HealthData>(HEALTH_QUERY);
}

