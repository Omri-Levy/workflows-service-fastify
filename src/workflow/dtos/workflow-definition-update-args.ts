import { WorkflowDefinitionWhereUniqueInput } from './workflow-where-unique-input';
import { WorkflowRuntimeDataUpdateSchema } from './workflow-runtime-data-update';

export class WorkflowDefinitionUpdateArgs {
  where!: WorkflowDefinitionWhereUniqueInput;
  data!: WorkflowRuntimeDataUpdateSchema;
}
