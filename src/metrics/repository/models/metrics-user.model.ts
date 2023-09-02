import { Type } from '@sinclair/typebox';

export const MetricsUserModelSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  lastActiveAt: Type.String()
});