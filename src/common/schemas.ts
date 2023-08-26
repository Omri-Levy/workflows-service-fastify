import { TSchema, Type } from "@sinclair/typebox";
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

export const createJsonValue = (id: string) => Type.Recursive((This) =>
    Type.Union([
      Type.String(),
      Type.Number(),
      Type.Boolean(),
      Type.Null(),
      Type.Array(This),
      Type.Record(Type.String(), This)
    ]),
  { $id: id }
);
export const TypeNullable = <TSchemas extends Array<TSchema>>(...schemas: TSchemas) => Type.Union([...schemas, Type.Null()]);

export const TypeNoNull = <T extends TSchema>(schema: T) =>
  Type.Exclude(schema, Type.Null());

export const BaseUserSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String(),
  phone: Type.Optional(
    TypeNullable(Type.String())
  ),
  password: Type.String(),
  roles: Type.Any(),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  lastActiveAt: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" }))
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
    TypeNullable(Type.String())
  ),
  endUserType: Type.Optional(
    TypeNullable(Type.String())
  ),
  approvalState: ApprovalStateSchema,
  stateReason: Type.Optional(
    TypeNullable(Type.String())
  ),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(
    TypeNullable(Type.String({ format: "email" }))
  ),
  phone: Type.Optional(
    TypeNullable(Type.String())
  ),
  country: Type.Optional(
    TypeNullable(Type.String())
  ),
  dateOfBirth: Type.Optional(
    TypeNullable(
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
      )
  ),
  avatarUrl: Type.Optional(
    TypeNullable(Type.String())
  ),
  nationalId: Type.Optional(
    TypeNullable(Type.String())
  ),
  additionalInfo: Type.Optional(Type.Any()),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" })
});


export const BaseBusinessSchema = Type.Object({
  id: Type.String(),
  correlationId: Type.Optional(
    TypeNullable(Type.String())
  ),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  companyName: Type.String(),
  registrationNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  legalForm: Type.Optional(
    TypeNullable(Type.String())
  ),
  country: Type.Optional(
    TypeNullable(Type.String())
  ),
  countryOfIncorporation: Type.Optional(
    TypeNullable(Type.String())
  ),
  dateOfIncorporation: Type.Optional(
    TypeNullable(
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    )
  ),
  address: Type.Optional(Type.Any()),
  phoneNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  email: Type.Optional(
    TypeNullable(Type.String({ format: "email" }))
  ),
  website: Type.Optional(
    TypeNullable(Type.String())
  ),
  industry: Type.Optional(
    TypeNullable(Type.String())
  ),
  taxIdentificationNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  vatNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  shareholderStructure: Type.Optional(Type.Any()),
  numberOfEmployees: Type.Optional(
    TypeNullable(Type.Number())
  ),
  businessPurpose: Type.Optional(
    TypeNullable(Type.String())
  ),
  documents: Type.Optional(Type.Any()),
  avatarUrl: Type.Optional(
    TypeNullable(Type.String())
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
    endUserId: TypeNullable(Type.String()),
    businessId: TypeNullable(Type.String()),
    assigneeId: TypeNullable(Type.String()),
    workflowDefinitionId: Type.String(),
    workflowDefinitionVersion: Type.Number(),
    context: Type.Any(),
    config: Type.Any(),
    state: TypeNullable(Type.String()),
    status: WorkflowRuntimeDataStatusSchema,
    createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    createdBy: Type.String({ default: "SYSTEM" }),
    resolvedAt: TypeNullable(
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    ),
    assignedAt: TypeNullable(
      Type.Unsafe<Date>({ type: "string", format: "date-time" }),
    )
  })
);

export const WorkflowDefinitionSchema = Type.Object({
  id: Type.String(),
  reviewMachineId: Type.Optional(
    TypeNullable(Type.String())
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

export const TypeObjectWithId = Type.Object({
  id: Type.String()
});