import { apolloClient } from "../../../lib/graphql/client";
import { SUBMIT_REPORT_MUTATION } from "../../../lib/mutations/report.mutations";
import apiClient from "../../../lib/api-client";

export interface SubmitReportPayload {
  targetType: "POST" | "USER" | "GROUP";
  targetId: string;
  reason: string;
}

export interface ReportRecord {
  id: string;
  reporterId?: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export const reportsApi = {
  submitReport: async (payload: SubmitReportPayload): Promise<ReportRecord> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SUBMIT_REPORT_MUTATION,
        variables: {
          targetType: payload.targetType,
          targetId: payload.targetId,
          reason: payload.reason,
        },
      });
      if (data?.submitReport) {
        return data.submitReport;
      }
    } catch (gqlError) {
      console.warn("GraphQL report submission failed, attempting REST fallback:", gqlError);
    }

    // REST fallback for full compatibility
    const restRes = await apiClient.post<any>("/api/admin/reports", payload);
    return restRes.data || restRes;
  },
};

export default reportsApi;
