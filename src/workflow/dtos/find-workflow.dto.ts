import { z } from 'zod';

export const FindWorkflowQuerySchema = z.object({
  filterId: z.string(),
});
