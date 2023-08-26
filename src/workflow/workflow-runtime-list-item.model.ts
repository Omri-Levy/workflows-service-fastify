import { IsNullable } from '@/common/decorators/is-nullable.decorator';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class WorkflowAssignee {
  @Expose()
  @IsNullable()
  @IsString()
  firstName!: string;

  @Expose()
  @IsNullable()
  @IsString()
  lastName!: string;
}
