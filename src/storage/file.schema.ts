import { Type } from "@sinclair/typebox";
import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";

export const FileSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  fileNameOnDisk: Type.String(),
  uri: Type.String(),
  fileNameInBucket: TypeNullable(Type.String()),
  createdAt: TypeDateString,
  createdBy: Type.String({ default: "SYSTEM" })
});