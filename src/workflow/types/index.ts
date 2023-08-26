import { TSortOrder } from "@/common/query-filters/sort-order";
import {
  Business,
  EndUser,
  User,
  WorkflowDefinition,
  WorkflowRuntimeData,
  WorkflowRuntimeDataStatus
} from "@prisma/client";
import { TApprovalState } from "@/common/enums";
import { WorkflowService } from "@/workflow/workflow.service";

export interface RunnableWorkflowData {
  workflowDefinition: WorkflowDefinition;
  workflowRuntimeData: WorkflowRuntimeData;
  ballerineEntityId?: string | null;
}

export type CompleteWorkflowData = WorkflowRuntimeData & {
  workflowDefinition: WorkflowDefinition;
};

export type TEntityType = 'endUser' | 'business';

export type TWorkflowWithRelations = WorkflowRuntimeData & {
  workflowDefinition: WorkflowDefinition;
  assignee: User;
  endUser: EndUser;
  business: Business;
};

export interface ListWorkflowsRuntimeParams {
  page?: number;
  size?: number;
  status?: WorkflowRuntimeDataStatus[];
  orderBy?: string;
  orderDirection?: TSortOrder;
}

export interface ListRuntimeDataResult {
  results: Array<{
    id: string;
    status: WorkflowRuntimeDataStatus;
    createdAt: Date;
    entity: {
      id?: string;
      name?: string;
      avatarUrl?: string | null;
      approvalState?: TApprovalState;
    };
    assignee: {
      id?: string;
      firstName?: string;
      lastName?: string;
    } | null;
  }>;
  meta: {
    pages: number;
    total: number;
  };
}

export type WorkflowRuntimeListQueryResult = WorkflowRuntimeData & {
  workflowDefinition: WorkflowDefinition;
  assignee: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
};
export type ListWorkflowRuntimeDataWithRelationsReturnType = Awaited<ReturnType<WorkflowService["listWorkflowRuntimeDataWithRelations"]>>;