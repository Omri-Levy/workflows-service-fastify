import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/common/schemas";

export const WorkflowDefinitionCreateSchema = Type.Composite([
  Type.Pick(WorkflowDefinitionSchema, [
    "name",
    "reviewMachineId",
    "definitionType",
    "definition",
    "extensions",
    "backend",
    "persistStates",
    "submitStates"
  ]),
  Type.Object({
    user: Type.Object({
      id: Type.String({
        description: "Unique ID of the user"
      })
    })
  })
]);