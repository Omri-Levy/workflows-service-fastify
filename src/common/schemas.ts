import { Type } from "@sinclair/typebox";
import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { WorkflowRuntimeData } from "@prisma/client";

export const ApprovalStateSchema = Type.Union([
  Type.Literal("APPROVED"),
  Type.Literal("REJECTED"),
  Type.Literal("PROCESSING"),
  Type.Literal("NEW")
]);

export const WorkflowRuntimeDataStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("completed"),
  Type.Literal("failed")
]);

export const BaseUserSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String(),
  phone: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  password: Type.String(),
  roles: Type.Any(),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  lastActiveAt: Type.Optional(Type.String({ format: "date-time" }))
});

export const EntitiesSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({
    format: "email"
  }),
  phone: Type.Optional(Type.String()),
  password: Type.String(),
  roles: Type.Any(),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" })
});

export const BaseEndUserSchema = Type.Object({
  id: Type.String(),
  isContactPerson: Type.Boolean({ default: false }),
  correlationId: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  endUserType: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  approvalState: ApprovalStateSchema,
  stateReason: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(
    Type.Union([Type.String({ format: "email" }), Type.Null()])
  ),
  phone: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  country: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  dateOfBirth: Type.Optional(
    Type.Union([
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
      Type.Null()
    ])
  ),
  avatarUrl: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  nationalId: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  additionalInfo: Type.Optional(Type.Any()),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" })
});


export const BaseBusinessSchema = Type.Object({
  id: Type.String(),
  correlationId: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  companyName: Type.String(),
  registrationNumber: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  legalForm: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  country: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  countryOfIncorporation: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  dateOfIncorporation: Type.Optional(
    Type.Union([
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
      Type.Null()
    ])
  ),
  address: Type.Optional(Type.Any()),
  phoneNumber: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  email: Type.Optional(
    Type.Union([Type.String({ format: "email" }), Type.Null()])
  ),
  website: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  industry: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  taxIdentificationNumber: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  vatNumber: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  shareholderStructure: Type.Optional(Type.Any()),
  numberOfEmployees: Type.Optional(
    Type.Union([Type.Number(), Type.Null()])
  ),
  businessPurpose: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  documents: Type.Optional(Type.Any()),
  avatarUrl: Type.Optional(
    Type.Union([Type.String(), Type.Null()])
  ),
  additionalInfo: Type.Optional(Type.Any()),
  bankInformation: Type.Optional(Type.Any()),
  approvalState: ApprovalStateSchema
});

export const BaseEndUsersOnBusinessesSchema = Type.Object({
  endUserId: Type.String(),
  businessId: Type.String()
});

export const BaseWorkflowRuntimeDataSchema =
  typeboxBuilder<WorkflowRuntimeData>()(
  Type.Object({
    id: Type.String(),
    endUserId: Type.Union([
      Type.String(),
      Type.Null()
    ]),
    businessId: Type.Union([
      Type.String(),
      Type.Null()
    ]),
    assigneeId: Type.Union([
      Type.String(),
      Type.Null()
    ]),
    workflowDefinitionId: Type.String(),
    workflowDefinitionVersion: Type.Number(),
    context: Type.Any(),
    config: Type.Any(),
    state: Type.Union([
      Type.String(),
      Type.Null()
    ]),
    status: WorkflowRuntimeDataStatusSchema,
    createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    createdBy: Type.String({ default: "SYSTEM" }),
    resolvedAt: Type.Union([
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
      Type.Null()
    ]),
    assignedAt: Type.Union([
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
      Type.Null()
    ])
  })
);

export const WorkflowDefinitionSchema = Type.Object({
  id: Type.String(),
  reviewMachineId: Type.Optional(
    Type.Union([
      Type.String(),
      Type.Null()
    ])
  ),
  name: Type.String(),
  version: Type.Number({ default: 1 }),
  definitionType: Type.String(),
  definition: Type.Any(),
  contextSchema: Type.Optional(Type.Any()),
  config: Type.Optional(Type.Any()),
  supportedPlatforms: Type.Optional(Type.Any()),
  extensions: Type.Optional(Type.Any()),
  backend: Type.Optional(Type.Any()),
  persistStates: Type.Optional(Type.Any()),
  submitStates: Type.Optional(Type.Any()),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  createdBy: Type.String({ default: "SYSTEM" }),
  workflowRuntimeData: Type.Array(
    BaseWorkflowRuntimeDataSchema
  )
});

export const WorkflowRuntimeDataSchema = Type.Composite(
  [
    BaseWorkflowRuntimeDataSchema,
    Type.Object({
      endUser: Type.Optional(BaseEndUserSchema),
      business: Type.Optional(BaseBusinessSchema),
      assignee:  Type.Optional(BaseUserSchema),
      workflowDefinition: WorkflowDefinitionSchema
    })
  ]
);

export const UserSchema = Type.Composite([
  BaseUserSchema,
  Type.Object({
    workflowRuntimeData: Type.Array(Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]))
  })
]);

export const EndUserSchema = Type.Composite(
  [
    BaseEndUserSchema,
    Type.Object({
      workflowRuntimeData: Type.Array(WorkflowRuntimeDataSchema),
      businesses: Type.Array(BaseBusinessSchema),
      endUsersOnBusinesses: Type.Array(BaseEndUsersOnBusinessesSchema)
    })
  ]
);

export const BusinessSchema = Type.Composite(
  [
    BaseBusinessSchema,
    Type.Object({
      workflowRuntimeData: Type.Array(WorkflowRuntimeDataSchema),
      endUsers: Type.Array(EndUserSchema),
      endUsersOnBusinesses: Type.Array(BaseEndUsersOnBusinessesSchema)
    })
  ]
);

export const EndUsersOnBusinessesSchema = Type.Composite(
  [
    BaseEndUsersOnBusinessesSchema,
    Type.Object({
      endUser: EndUserSchema,
      business: BusinessSchema
    })
  ]
);

export const FileSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  fileNameOnDisk: Type.String(),
  uri: Type.String(),
  fileNameInBucket: Type.Optional(Type.String()),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  createdBy: Type.String({ default: "SYSTEM" })
});

export const PolicySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  version: Type.Number(),
  tasks: Type.Any(),
  rulesSets: Type.Any()
});

export const FilterSchema = Type.Recursive((This) => Type.Object({
  id: Type.String(),
  name: Type.String(),
  entity: Type.String(),
  query: Type.Any(),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  createdBy: Type.String(),
  sortOrder: Type.Optional(Type.Number()),
  parentFilterId: Type.Optional(Type.String()),
  parentFilter: Type.Optional(This)
}));