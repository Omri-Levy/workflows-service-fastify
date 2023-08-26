import { z, ZodSchema } from "zod";

/**
 * Checks if the input matches the schema. By using a type predicate, this
 * function can be used as a type guard.
 *
 * @param schema The schema to be used.
 * @param input The input to be tested.
 *
 * @returns Whether the input matches the scheme.
 */
export const isType = <TSchema extends ZodSchema, >(
  schema: TSchema
) => (input: unknown): input is z.output<TSchema> => {
  return schema.safeParse(input).success;
};