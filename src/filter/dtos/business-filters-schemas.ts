/* Businesses */
import {
  IntNullableFilterSchema,
  NestedEnumApprovalStateFilter,
  zApprovalStateEnum,
  zDateTimeFilterDateStringUnion,
  zDateTimeNullableFilterDateStringUnion,
  zStringFilterStringUnion,
  zStringNullableFilterStringNullUnion
} from "@/filter/dtos/filters-util-schemas";
import { z } from "zod";

export const BaseBusinessSelectSchema = z.object({
  id: z.boolean(),
  companyName: z.boolean(),
  registrationNumber: z.boolean(),
  legalForm: z.boolean(),
  countryOfIncorporation: z.boolean(),
  dateOfIncorporation: z.boolean(),
  address: z.boolean(),
  phoneNumber: z.boolean(),
  email: z.boolean(),
  website: z.boolean(),
  industry: z.boolean(),
  taxIdentificationNumber: z.boolean(),
  vatNumber: z.boolean(),
  shareholderStructure: z.boolean(),
  numberOfEmployees: z.boolean(),
  businessPurpose: z.boolean(),
  documents: z.boolean(),
  approvalState: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean()
}).partial();

export const BaseBusinessWhereInputSchema = z.object({
  id: zStringFilterStringUnion,
  companyName: zStringFilterStringUnion,
  registrationNumber: zStringFilterStringUnion,
  legalForm: zStringFilterStringUnion,
  countryOfIncorporation: zStringFilterStringUnion,
  dateOfIncorporation: zDateTimeNullableFilterDateStringUnion,
  address: zStringFilterStringUnion,
  phoneNumber: zStringNullableFilterStringNullUnion,
  email: zStringNullableFilterStringNullUnion,
  website: zStringNullableFilterStringNullUnion,
  industry: zStringFilterStringUnion,
  taxIdentificationNumber: zStringNullableFilterStringNullUnion,
  vatNumber: zStringNullableFilterStringNullUnion,
  numberOfEmployees: z.union([IntNullableFilterSchema, z.number(), z.null()]),
  businessPurpose: zStringNullableFilterStringNullUnion,
  approvalState: z.union([NestedEnumApprovalStateFilter, zApprovalStateEnum]),
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion
}).partial();

