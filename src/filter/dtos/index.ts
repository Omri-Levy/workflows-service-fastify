import { z } from "zod";
import {
  BaseBusinessSelectSchema,
  BaseBusinessWhereInputSchema
} from "@/filter/dtos/business-filters-schemas";
import {
  BaseEndUserSelectSchema,
  BaseEndUserWhereInputSchema
} from "@/filter/dtos/end-user-filters-schemas";
import {
  BaseUserSelectSchema,
  BaseUserWhereInputSchema
} from "@/filter/dtos/user-filters-schemas";
import {
  BaseWorkflowDefinitionSelectSchema,
  BaseWorkflowDefinitionWhereInputSchema
} from "@/filter/dtos/workflow-definition-filters-schemas";
import {
  BaseWorkflowRuntimeDataSelectSchema,
  BaseWorkflowRuntimeDataWhereInputSchema
} from "@/filter/dtos/workflow-runtime-data-filters-schemas";

// Step 1: Define relation filter schemas since they don't depend on any other schema in the file.
export const BusinessRelationFilterSchema = z.object({
  is: BaseBusinessWhereInputSchema,
  isNot: BaseBusinessWhereInputSchema,
}).partial();

export const EndUserRelationFilterSchema = z.object({
  is: BaseEndUserWhereInputSchema,
  isNot: BaseEndUserWhereInputSchema,
}).partial();

export const UserRelationFilterSchema = z.object({
  is: BaseUserWhereInputSchema,
  isNot: BaseUserWhereInputSchema,
}).partial();

export const WorkflowDefinitionRelationFilterSchema = z.object({
  is: BaseWorkflowDefinitionWhereInputSchema,
  isNot: BaseWorkflowDefinitionWhereInputSchema,
}).partial();

// Step 2: Define WorkflowRuntimeDataListRelationFilterSchema since it depends on WorkflowRuntimeDataWhereInputSchema, which will be defined in the next step.
export const WorkflowRuntimeDataListRelationFilterSchema = z.object({
  every: BaseWorkflowRuntimeDataWhereInputSchema,
  some: BaseWorkflowRuntimeDataWhereInputSchema,
  none: BaseWorkflowRuntimeDataWhereInputSchema
}).partial();

// Step 3: Define schemas that depend on previously defined schemas.
export const WorkflowRuntimeDataWhereInputSchema = BaseWorkflowRuntimeDataWhereInputSchema.extend({
  endUser: z.union([EndUserRelationFilterSchema, BaseEndUserWhereInputSchema, z.null()]),
  business: z.union([BusinessRelationFilterSchema, BaseBusinessWhereInputSchema, z.null()]),
  workflowDefinition: WorkflowDefinitionRelationFilterSchema.or(
    BaseWorkflowDefinitionWhereInputSchema
  ),
  assignee: BaseUserWhereInputSchema.or(UserRelationFilterSchema)
}).partial().strict();

export const BusinessWhereInputSchema = BaseBusinessWhereInputSchema.extend({
  workflowRuntimeData: WorkflowRuntimeDataListRelationFilterSchema.optional()
});

export const EndUserWhereInputSchema = BaseEndUserWhereInputSchema.extend({
  workflowRuntimeData: WorkflowRuntimeDataListRelationFilterSchema.optional()
});

export const UserWhereInputSchema = BaseUserWhereInputSchema.extend({
  workflowRuntimeData: WorkflowRuntimeDataListRelationFilterSchema.optional()
});

export const WorkflowDefinitionWhereInput = BaseWorkflowDefinitionWhereInputSchema.extend({
  workflowRuntimeData: WorkflowRuntimeDataListRelationFilterSchema.optional()
});

// Step 4: Define the select schemas.
export const BusinessSelectSchema = BaseBusinessSelectSchema.extend({
  workflowRuntimeData: z.union([
    z.boolean(),
    z.object({
      select: BaseWorkflowRuntimeDataSelectSchema.nullable().optional()
    })
  ]),
  endUsers: z.boolean(),
  endUsersOnBusinesses: z.boolean()
}).partial();

export const EndUserSelectSchema = BaseEndUserSelectSchema.extend({
  workflowRuntimeData: z.union([
    z.boolean(),
    z.object({
      select: BaseWorkflowRuntimeDataSelectSchema.nullable().optional()
    })
  ]),
  businesses: z.boolean(),
  endUsersOnBusinesses: z.boolean()
}).partial();

export const UserSelectSchema = BaseUserSelectSchema.extend({
  workflowRuntimeData: z.union([
    z.boolean(),
    z.object({
      select: BaseWorkflowRuntimeDataSelectSchema.nullable().optional()
    })
  ]).optional()
});

export const WorkflowDefinitionSelectSchema = BaseWorkflowDefinitionSelectSchema.extend({
  workflowRuntimeData: z.union([
    z.boolean(),
    z.object({
      select: BaseWorkflowRuntimeDataSelectSchema.nullable().optional()
    })
  ]).optional()
});

export const WorkflowRuntimeDataSelectSchema = BaseWorkflowRuntimeDataSelectSchema.extend({
  endUser: z.union([
    z.boolean(),
    z.object({
      select: BaseEndUserSelectSchema.strict().nullable().optional()
    })
  ]),
  business: z.union([
    z.boolean(),
    z.object({
      select: BaseBusinessSelectSchema.strict().nullable().optional()
    })
  ]),
  workflowDefinition: z.union([
    z.boolean(),
    z.object({
      select: BaseWorkflowDefinitionSelectSchema.strict().nullable().optional()
    })
  ]),
  assignee: z.union([
    z.boolean(),
    z.object({
      select:  BaseUserSelectSchema.strict().nullable().optional()
    })
  ])
}).partial();

// Step 5: Define remaining top-level schemas.
export const WorkflowRuntimeDataFilterQuerySchema = z.object({
  select: WorkflowRuntimeDataSelectSchema.strict().refine(
    (v: Record<PropertyKey, unknown>) => Object.keys(v).length > 0,
    "At least one `select` field must be provided"
  ).optional(),
  where: WorkflowRuntimeDataWhereInputSchema.optional()
}).refine(v => v.select || v.where, "At least `query.select` or `query.where` must be provided");

export const FilterCreateSchema = z.object({
  name: z.string(),
  entity: z.enum(["individuals", "businesses"]),
  query: WorkflowRuntimeDataFilterQuerySchema
});

export const WorkflowDefinitionWhereInputSchema = BaseWorkflowDefinitionWhereInputSchema.extend({
  workflowRuntimeData: WorkflowRuntimeDataListRelationFilterSchema.optional()
});
