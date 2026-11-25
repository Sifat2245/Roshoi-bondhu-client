import { gql } from '@apollo/client';

export const SUBMIT_REPORT_MUTATION = gql`
  mutation SubmitReport($targetType: String!, $targetId: String!, $reason: String!) {
    submitReport(targetType: $targetType, targetId: $targetId, reason: $reason) {
      id
      reporterId
      targetType
      targetId
      reason
      status
      createdAt
    }
  }
`;

