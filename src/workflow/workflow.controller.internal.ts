/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { isRecordNotFoundError } from "@/db/db.util";
import { ResubmissionReason, TResubmissionReason, WorkflowService } from "./workflow.service";
import { FindWorkflowsListLogicSchema, FindWorkflowsListSchema } from "@/workflow/dtos/find-workflows-list.dto";
import { FilterService } from "@/filter/filter.service";


import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import {
  TypeNullable,
  WorkflowDefinitionSchema,
  WorkflowRuntimeDataSchema,
  WorkflowRuntimeDataStatusSchema
} from "@/common/schemas";
import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { Type } from "@sinclair/typebox";
import { FilterRepository } from "@/filter/filter.repository";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ListWorkflowRuntimeDataWithRelationsReturnType } from "@/workflow/types";
import { WorkflowDefinitionCreateSchema } from "@/workflow/dtos/workflow-definition-create";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { NotFoundError } from "@/common/errors/not-found-error";
import { WorkflowRuntimeDataUpdateSchema } from "@/workflow/dtos/workflow-runtime-data-update";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import EventEmitter from "events";
import { HttpService } from "@/http/http.service";
import { env } from "@/env";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";

export const workflowsControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

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
  const eventEmitter = new EventEmitter();
  const workflowEventEmitter = new WorkflowEventEmitterService(eventEmitter);
  const httpService = new HttpService();
  const config = {
    NODE_ENV: env.NODE_ENV,
    WEBHOOK_URL: env.WEBHOOK_URL,
    WEBHOOK_SECRET: env.WEBHOOK_SECRET
  } satisfies TWebhookConfig
  const documentChangedWebhookCaller = new DocumentChangedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config,
  );
  const workflowStateChangedWebhookCaller = new WorkflowStateChangedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config,
  );
  const workflowCompletedWebhookCaller = new WorkflowCompletedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config,
  );
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService,
    workflowEventEmitter,
    documentChangedWebhookCaller,
    workflowStateChangedWebhookCaller,
    workflowCompletedWebhookCaller
  );

  // createWorkflowDefinition
  fastify.post("/", {
      schema: {
        description: "Creates a workflow definition",
        tags: ["Internal", "Workflows"],
        body: WorkflowDefinitionCreateSchema,
        response: {
          201: Type.Pick(WorkflowDefinitionSchema, [
              "id",
              "name",
              "version",
              "definition",
              "definitionType",
              "backend",
              "extensions",
              "persistStates",
              "submitStates"
            ]
          ),
          400: Type.Object({
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
      const workflowDefinition = await workflowService.createWorkflowDefinition(req.body);

      return reply.status(201).send(workflowDefinition);
    });

  // listWorkflowRuntimeData
  fastify.get("/", {
      schema: {
        description: "Fetches a list of workflow runtime data",
        tags: ["Internal", "Workflow"],
        querystring: FindWorkflowsListSchema,
        response: {
          200: typeboxBuilder<ListWorkflowRuntimeDataWithRelationsReturnType>()(
            Type.Object({
              data: typeboxBuilder<ListWorkflowRuntimeDataWithRelationsReturnType["data"]>()(
                Type.Array(
                  Type.Object({
                    id: Type.String(),
                    status: WorkflowRuntimeDataStatusSchema,
                    createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
                    entity: Type.Object({
                      id: Type.Optional(Type.String()),
                      name: Type.Optional(Type.String()),
                      avatarUrl: Type.Optional(
                        TypeNullable(
                          Type.String()
                        )
                      )
                    }),
                    assignee: TypeNullable(
                      Type.Object({
                        id: Type.Optional(Type.String()),
                        firstName: Type.Optional(Type.String()),
                        lastName: Type.Optional(Type.String())
                      })
                    )
                  })
                )
              ),
              meta: Type.Object({
                totalItems: Type.Number(),
                totalPages: Type.Number()
              })
            })),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
      const entityType = filter.entity as "individuals" | "businesses";
      const { orderBy } = FindWorkflowsListLogicSchema[entityType].parse(queryParams);
      const workflowsRuntimeDataWithRelations = await workflowService.listWorkflowRuntimeDataWithRelations({
        args: filter.query as any,
        entityType,
        orderBy,
        page,
        filters
      });
      console.log(workflowsRuntimeDataWithRelations);
      return reply.send(workflowsRuntimeDataWithRelations);
    });


  // getRunnableWorkflowById
  fastify.get("/:id", {
      schema: {
        description: "Retrieve a workflow by its unique ID",
        tags: ["Internal", "Workflow"],
        querystring: Type.Object({
          filterId: Type.String({ description: "Unique ID of a filter" })
        }),
        params: Type.Object({
          id: Type.String({ description: "Unique ID of a workflow" })
        }),
        response: {
          200: Type.Object({
            entity: Type.Object({
              id: Type.String(),
              name: Type.String(),
              avatarUrl: Type.Optional(
                TypeNullable(
                  Type.String()
                )
              )
            }),
            assignee: Type.Optional(
              TypeNullable(
                Type.Object({
                  id: Type.String(),
                  firstName: Type.String(),
                  lastName: Type.String()
                }))
            ),
            nextEvents: Type.Array(Type.String())
          }, {
            additionalProperties: true,
            description: "Response data may include other properties from workflowRuntimeData, or workflowDefinition depending on passed filter"
          }),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
      try {
        const filter = await filterService.getById(req.query.filterId);
        const workflowRuntimeData = await workflowService.getWorkflowByIdWithRelations(req.params.id, filter.query as any);

        return reply.send(workflowRuntimeData);
      } catch (err) {

        if (isRecordNotFoundError(err)) {
          return reply
            .status(StatusCodes.NOT_FOUND)
            .send({
              status: getReasonPhrase(StatusCodes.NOT_FOUND),
              message: `No resource was found for ${JSON.stringify(req.params.id)}`
            });
        }

        throw err;
      }
    });

  // listActiveStates
  fastify.get("/active-states", {
      schema: {
        description: "Fetches a list of workflow runtime data",
        tags: ["Internal", "Workflows"],
        response: {
          200: Type.Array(
            Type.Pick(
              WorkflowRuntimeDataSchema,
              [
                "id",
                "state",
                "status",
                "endUserId",
                "businessId",
                "assigneeId",
                "workflowDefinitionId"
              ]
            )
          ),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
      try {
        const workflowRuntimeData = await workflowService.listActiveWorkflowsRuntimeStates();

        return reply.send(workflowRuntimeData);
      } catch (err) {
        // TODO: Remove - this endpoint does not throw 404
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found`);
        }

        throw err;
      }
    });

  // event
  fastify.post("/:id/event", {
      schema: {
        description: "Send an event to the workflow with a payload",
        tags: ["Internal", "Workflows"],
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
        }, {
          additionalProperties: false
        }),
        response: {
          200: {
            type: "null",
            description: "Event sent successfully"
          },
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
    }
    , async (req, reply) => {
      try {
        const { name, document, resubmissionReason } = req.body;

        await workflowService.event({
          id: req.params.id,
          name,
          document,
          resubmissionReason
        });

        return reply.send();
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }

        throw err;
      }
    });

  // updateById
  fastify.patch("/:id", {
      schema: {
        description: "Update a workflow runtime data by its unique ID",
        tags: ["Internal", "Workflow"],
        params: Type.Object({
          id: Type.String({ description: "ID of the workflow runtime data" })
        }),
        body: WorkflowRuntimeDataUpdateSchema,
        response: {
          200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
      try {
        const workflowRuntimeData = await workflowService.updateWorkflowRuntimeData(req.params.id, req.body);

        return reply.send(workflowRuntimeData);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }
        throw err;
      }
    });

  // assignWorkflowById
  fastify.patch("/assign/:id", {
      schema: {
        description: "Assign a workflow runtime data by its unique ID to a user",
        tags: ["Internal", "Workflows"],
        params: Type.Object({
          id: Type.String({ description: "Unique ID of the workflow" })
        }),
        body: Type.Object({
          assigneeId: TypeNullable(
            Type.String({ description: "ID of the user to assign the workflow to" })
          )
        }, {
          additionalProperties: false
        }),
        response: {
          200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
    }
    , async (req, reply) => {
      try {
        const workflowRuntimeData = await workflowService.assignWorkflowToUser(req.params.id, req.body);

        return reply.send(workflowRuntimeData);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }
        throw err;
      }
    });

  // deleteWorkflowDefinitionById
  fastify.delete("/:id", {
      schema: {
        description: "Delete a workflow definition by its unique ID",
        tags: ["Internal", "Workflows"],
        params: Type.Object({
          id: Type.String({ description: "ID of the workflow" })
        }),
        response: {
          200: Type.Pick(
            WorkflowDefinitionSchema,
            [
              "id",
              "name",
              "version",
              "definition",
              "definitionType",
              "backend",
              "extensions",
              "persistStates",
              "submitStates"
            ]
          ),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
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
      try {
        const workflowDefinition = await workflowService.deleteWorkflowDefinitionById(req.params.id, {
          select: {
            id: true,
            name: true,
            version: true,

            definition: true,
            definitionType: true,
            backend: true,

            extensions: true,
            persistStates: true,
            submitStates: true
          }
        });

        return reply.send(workflowDefinition);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }
        throw err;
      }
    });

};