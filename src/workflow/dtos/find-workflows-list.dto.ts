import { ApiProperty } from '@nestjs/swagger';
import { WorkflowRuntimeDataStatus } from '@prisma/client';
import { Type } from '@sinclair/typebox';
import { z } from 'zod';
import { WorkflowRuntimeDataStatusSchema } from "@/common/schemas";

class PageDto {
  @ApiProperty()
  number!: number;

  @ApiProperty()
  size!: number;
}

class FilterDto {
  @ApiProperty()
  assigneeId?: (string | null)[];

  @ApiProperty()
  status?: WorkflowRuntimeDataStatus[];
}

export class FindWorkflowsListDto {
  @ApiProperty()
  filterId!: string;

  @ApiProperty()
  orderBy!: string;

  @ApiProperty()
  page!: PageDto;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  filter?: FilterDto;
}

const validateOrderBy = (value: unknown, validColumns: readonly string[]) => {
  if (typeof value !== 'string') {
    throw new Error('Invalid orderBy');
  }

  const [column = '', direction = ''] = value.split(':');

  if (!validColumns.includes(column)) {
    throw new Error(`Invalid column: ${column}`);
  }

  // @ts-expect-error
  if (!sortDirections.includes(direction)) {
    throw new Error(`Invalid direction: ${direction}`);
  }

  return value;
};

export const FindWorkflowsListSchema = Type.Object({
  filterId: Type.String(),
  orderBy: Type.Optional(Type.String()),
  page: Type.Object({
    number: Type.Integer({ minimum: 0 }),
    size: Type.Integer({ minimum: 0 }),
  }),
  filter: Type.Optional(Type.Object({
    assigneeId: Type.Optional(Type.Array(Type.Union([
      Type.Literal(''),
      Type.String({ minLength: 1 })
    ]))),
    status: Type.Optional(Type.Array(WorkflowRuntimeDataStatusSchema)),
  })),
});

const sortDirections = ['asc', 'desc'] as const;
const sortableColumnsIndividuals = ['createdAt', 'firstName', 'lastName', 'email'] as const;
const sortableColumnsBusinesses = ['createdAt', 'companyName'] as const;

export const FindWorkflowsListLogicSchema = {
  individuals: z.object({
    orderBy:
      z.custom<`${(typeof sortableColumnsIndividuals)[number]}:${(typeof sortDirections)[number]}`>(
        value => validateOrderBy(value, sortableColumnsIndividuals),
      ),
  }),
  businesses: z.object({
    orderBy:
      z.custom<`${(typeof sortableColumnsBusinesses)[number]}:${(typeof sortDirections)[number]}`>(
        value => validateOrderBy(value, sortableColumnsBusinesses),
      ),
  }),
} as const;
