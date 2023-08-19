/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as common from '@nestjs/common';
import { UseGuards, UsePipes } from '@nestjs/common';
import * as swagger from '@nestjs/swagger';
import * as nestAccessControl from 'nest-access-control';
import { isRecordNotFoundError } from '@/db/db.util';
import * as errors from '../errors';
import { ResubmissionReason, TResubmissionReason, WorkflowService } from "./workflow.service";
import { WorkflowDefinitionCreateSchema } from './dtos/workflow-definition-create';
import { WorkflowDefinitionWhereUniqueInput } from './dtos/workflow-where-unique-input';
import { WorkflowDefinitionModel } from './workflow-definition.model';
import { WorkflowEventInput } from './dtos/workflow-event-input';
import { UserData } from '@/user/user-data.decorator';
import { UserInfo } from '@/user/user-info';
import { WorkflowDefinition, WorkflowRuntimeData } from '@prisma/client';
import { ApiNestedQuery } from '@/common/decorators/api-nested-query.decorator';
import { WorkflowDefinitionUpdateInput } from '@/workflow/dtos/workflow-definition-update-input';
import {
  FindWorkflowsListDto,
  FindWorkflowsListLogicSchema,
  FindWorkflowsListSchema,
} from '@/workflow/dtos/find-workflows-list.dto';
import { ZodValidationPipe } from '@/common/pipes/zod.pipe';
import { FilterService } from '@/filter/filter.service';
import {
  FindWorkflowParamsDto,
  FindWorkflowQueryDto,
  FindWorkflowQuerySchema,
} from '@/workflow/dtos/find-workflow.dto';
import { WorkflowAssigneeGuard } from '@/auth/workflow-assignee.guard';
import { WorkflowAssigneeId } from '@/workflow/dtos/workflow-assignee-id';
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import { WorkflowDefinitionSchema, WorkflowRuntimeDataSchema, WorkflowRuntimeDataStatusSchema } from "@/common/schemas";
import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { Type } from '@sinclair/typebox';
import { FilterRepository } from "@/filter/filter.repository";
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

@swagger.ApiTags('internal/workflows')
@common.Controller('internal/workflows')
export class WorkflowControllerInternal {
  constructor(
    protected readonly service: WorkflowService,
    protected readonly filterService: FilterService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
  ) {}

  @common.Post()
  @swagger.ApiCreatedResponse({ type: WorkflowDefinitionModel })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async createWorkflowDefinition(
    @UserData() userInfo: UserInfo,
    @common.Body() data: WorkflowDefinitionCreateSchema,
  ) {
    return await this.service.createWorkflowDefinition(data);
  }

  @common.Get()
  @swagger.ApiOkResponse()
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  @ApiNestedQuery(FindWorkflowsListDto)
  @UsePipes(new ZodValidationPipe(FindWorkflowsListSchema, 'query'))
  async listWorkflowRuntimeData(
    @common.Query() { filterId, page, filter: filters, ...queryParams }: FindWorkflowsListDto,
  ) {
    const filter = await this.filterService.getById(filterId);

    const entityType = filter.entity as 'individuals' | 'businesses';

    const { orderBy } = FindWorkflowsListLogicSchema[entityType].parse(queryParams);

    return await this.service.listWorkflowRuntimeDataWithRelations({
      args: filter.query as any,
      entityType,
      orderBy,
      page,
      filters,
    });
  }

  @common.Get('/:id')
  @swagger.ApiOkResponse()
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  @ApiNestedQuery(FindWorkflowQueryDto)
  @UsePipes(new ZodValidationPipe(FindWorkflowQuerySchema, 'query'))
  async getRunnableWorkflowDataById(
    @common.Param() { id }: FindWorkflowParamsDto,
    @common.Query() { filterId }: FindWorkflowQueryDto,
  ) {
    const filter = await this.filterService.getById(filterId);

    return await this.service.getWorkflowByIdWithRelations(id, filter.query as any);
  }

  @common.Get('/active-states')
  @swagger.ApiOkResponse({ type: WorkflowDefinitionModel })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async listActiveStates() {
    try {
      return await this.service.listActiveWorkflowsRuntimeStates();
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(`No resource was found`);
      }
      throw error;
    }
  }

  @common.Post('/:id/event')
  @swagger.ApiOkResponse()
  @common.HttpCode(200)
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async event(
    @common.Param() params: WorkflowDefinitionWhereUniqueInput,
    @common.Body() data: WorkflowEventInput,
  ): Promise<void> {
    return await this.service.event({
      ...data,
      id: params.id,
    });
  }

  // PATCH /workflows/:id
  @common.Patch('/:id')
  @swagger.ApiOkResponse({ type: WorkflowDefinitionModel })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  @UseGuards(WorkflowAssigneeGuard)
  async updateById(
    @common.Param() params: WorkflowDefinitionWhereUniqueInput,
    @common.Body() data: WorkflowDefinitionUpdateInput,
  ): Promise<WorkflowRuntimeData> {
    try {
      return await this.service.updateWorkflowRuntimeData(params.id, data);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(params)}`);
      }
      throw error;
    }
  }

  // PATCH /workflows/assign/:id
  // curl -X PATCH http://localhost:3000/api/v1/internal/workflows/assign/:workflowId \
  // -H 'Content-Type: application/json' \
  // -H 'Cookie: session=[SESSION]; session.sig=[SESSION_SIG]' \
  // -d '{"assigneeId": "[ASSIGNEE_ID]"}'
  @common.Patch('/assign/:id')
  @swagger.ApiOkResponse({ type: WorkflowDefinitionModel })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async assignWorkflowById(
    @common.Param() params: WorkflowDefinitionWhereUniqueInput,
    @common.Body() data: WorkflowAssigneeId,
  ): Promise<WorkflowRuntimeData> {
    try {
      return await this.service.assignWorkflowToUser(params.id, data);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(params)}`);
      }
      throw error;
    }
  }

  @nestAccessControl.UseRoles({
    resource: 'Workflow',
    action: 'delete',
    possession: 'own',
  })
  @common.Delete('/:id')
  @swagger.ApiOkResponse({ type: WorkflowDefinitionModel })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async deleteWorkflowDefinitionById(
    @common.Param() params: WorkflowDefinitionWhereUniqueInput,
  ): Promise<WorkflowDefinition> {
    try {
      return await this.service.deleteWorkflowDefinitionById(params.id, {
        select: {
          id: true,
          name: true,
          version: true,

          definition: true,
          definitionType: true,
          backend: true,

          extensions: true,
          persistStates: true,
          submitStates: true,
        },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(params)}`);
      }
      throw error;
    }
  }
}

export const workflowsControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
  const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
  const businessRepository = new BusinessRepository(db);
  const fileRepository = new FileRepository(db);
  const storageService = new StorageService(fileRepository);
  const fileService = new FileService();
  const filterRepository = new FilterRepository(db);
  const filterService = new FilterService(filterRepository);
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService
  );

  // createWorkflowDefinition
  fastify.post("/", {
      schema: {
        description: "Creates a workflow definition",
        tags: ["External", "Workflows"],
        body: WorkflowDefinitionCreateSchema,
        response: {
          200: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
          400: Type.Object({
            status: Type.Optional(Type.String()),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    },
    async (req, reply) => {
      const workflowDefinition = await workflowService.createWorkflowDefinition(req.body);

      return reply.send(workflowDefinition);
    }
  );

  // listWorkflowRuntimeData
  fastify.get("/",
    {
      schema: {
        description: "Fetches a list of workflow runtime data",
        tags: ["External", "Workflow"],
        params: Type.Object({
          id: Type.String({ description: "Unique ID of the workflow definition" })
        }),
        querystring: FindWorkflowsListSchema,
        response: {
          200: Type.Object({
            data: WorkflowRuntimeDataSchema,
            meta: Type.Object({
              totalItems: Type.Number(),
              totalPages: Type.Number(),
            })
          }),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    },
    async (req, reply) => {
      const { filterId, page, filter: filters, ...queryParams } = req.query;
      const filter = await filterService.getById(filterId);
      const entityType = filter.entity as 'individuals' | 'businesses';
      const { orderBy } = FindWorkflowsListLogicSchema[entityType].parse(queryParams);
      const workflowRuntimeData = await workflowService.listWorkflowRuntimeDataWithRelations({
        args: filter.query as any,
        entityType,
        orderBy,
        page,
        filters,
      });

      return reply.send(workflowRuntimeData);
    });

  // getRunnableWorkflowById
  fastify.get("/:id",
    {
      schema: {
        description: "Retrieve an end-user by its unique ID",
        tags: ["External", "Workflow"],
        params: Type.Object({
          id: Type.String({ description: "Unique ID of the end user" })
        }),
        response: {
          200: Type.Object({
            workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
            workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"])
          }),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    },
    async (req, reply) => {
      const filter = await this.filterService.getById(filterId);
      const workflowRuntimeData = await this.workflowService.getRunnableWorkflowById(filter.query as any);

      return reply.send(workflowRuntimeData);
    });

  // listActiveStates
  fastify.get("/active-states", {
    schema: {
      description: "Update a workflow runtime data by its unique ID",
      tags: ["External", "Workflow"],
      params: Type.Object({
        id: Type.String({ description: "ID of the workflow runtime data" })
      }),
      body: Type.Object({
        status: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.status),
        state: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.state),
        context: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.context),
        assigneeId: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.assigneeId),
        resolvedAt: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.resolvedAt)
      }),
      response: {
        200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
        404: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    try {
      const workflowRuntimeData = await workflowService.listActiveWorkflowsRuntimeStates();

      return reply.send(workflowRuntimeData);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        throw new errors.NotFoundException(`No resource was found`);
      }

      throw err;
    }
  });

  // event
  fastify.post("/:id/event", {
      schema: {
        description: "Send an event to the workflow with a payload",
        tags: ["External", "Workflows"],
        params: Type.Object({
          id: Type.String({ description: "ID of the workflow" })
        }),
        body: Type.Object({
          name: Type.String(),
          document: Type.Optional(Type.String({
            description: "Which document requires re-submission - only required for re-submission"
          })),
          resubmissionReason: typeboxBuilder<TResubmissionReason>()(
            Type.Optional(
              Type.Union([
                Type.Literal(ResubmissionReason.BLURRY_IMAGE),
                Type.Literal(ResubmissionReason.CUT_IMAGE),
                Type.Literal(ResubmissionReason.UNSUPPORTED_DOCUMENT),
                Type.Literal(ResubmissionReason.DAMAGED_DOCUMENT),
                Type.Literal(ResubmissionReason.EXPIRED_DOCUMENT),
                Type.Literal(ResubmissionReason.COPY_OF_A_COPY),
                Type.Literal(ResubmissionReason.FACE_IS_UNCLEAR),
                Type.Literal(ResubmissionReason.FACE_IS_NOT_MATCHING)
              ], {
                description: "Only required for re-submission"
              })
            )
          )
        }),
        response: {
          200: {
            type: "null",
            description: "Event sent successfully"
          },
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    }
    , async (req, reply) => {
      await workflowService.event({
        ...req.body,
        id: req.params.id
      });

      return reply.send();
    });

  // updateById
  fastify.patch("/:id", {
    schema: {
      description: "Update a workflow runtime data by its unique ID",
      tags: ["External", "Workflow"],
      params: Type.Object({
        id: Type.String({ description: "ID of the workflow runtime data" })
      }),
      body: Type.Object({
        status: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.status),
        state: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.state),
        context: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.context),
        assigneeId: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.assigneeId),
        resolvedAt: Type.Optional(WorkflowRuntimeDataStatusSchema.properties.resolvedAt)
      }),
      response: {
        200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
        404: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    try {
      const workflowRuntimeData = await workflowService.updateWorkflowRuntimeData(req.params.id, req.body);

      return reply.send(workflowRuntimeData);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(req.params.id)}`);
      }
      throw error;
    }
  });

  // assignWorkflowById
  fastify.patch("/assign/:id", {
      schema: {
        description: "Retrieve a",
        tags: ["External", "Workflows"],
        body: Type.Object({
          entityId: Type.String({ description: "ID of the business or individual" }),
          intentName: Type.String({ description: "Name of the intent" })
        }),
        response: {
          200: Type.Tuple([
              Type.Object({
                workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
                workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
                ballerineEntityId: Type.String({
                  description: "ID of the business or individual"
                })
              })
            ]
          ),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    }
    , async (req, reply) => {
      try {
        const workflowRuntimeData = await workflowService.updateWorkflowRuntimeData(params.id, data);

        return workflowRuntimeData;
      } catch (error) {
        if (isRecordNotFoundError(error)) {
          throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }

        throw error;
      }
    });

  // deleteWorkflowDefinitionById
  fastify.delete("/:id", {
    schema: {
      description: "Creates or updates an entity and a workflow runtime data",
      tags: ["External", "Workflows"],
      body: Type.Object({
        workflowId: Type.String({ description: "ID of the workflow" }),
        context: WorkflowRuntimeDataSchema.properties.context,
        config: WorkflowRuntimeDataSchema.properties.config
      }),
      response: {
        200: Type.Object({
          workflowDefinitionId: Type.String(),
          workflowRuntimeId: Type.String(),
          ballerineEntityId: Type.String({
            description: "ID of the business or individual"
          })
        }),
        404: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    try {
      return await this.service.deleteWorkflowDefinitionById(params.id, {
        select: {
          id: true,
          name: true,
          version: true,

          definition: true,
          definitionType: true,
          backend: true,

          extensions: true,
          persistStates: true,
          submitStates: true,
        },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(params)}`);
      }
      throw error;
    }
  });

};