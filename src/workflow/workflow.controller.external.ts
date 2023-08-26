/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { isRecordNotFoundError } from "@/db/db.util";
import { NotFoundError } from "@/common/errors/not-found-error";
import { ResubmissionReason, TResubmissionReason, WorkflowService } from "./workflow.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import {
  TypeNoNull, TypeNullable,
  WorkflowDefinitionSchema,
  WorkflowRuntimeDataSchema,
  WorkflowRuntimeDataStatusSchema
} from "@/common/schemas";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { SortOrderSchema } from "@/common/query-filters/sort-order";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/common/errors/bad-request-error";

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
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService
  );

  // listWorkflowRuntimeData
  fastify.get("/", {
      schema: {
        description: "Fetch a list of workflows",
        tags: ["External", "Workflows"],
        querystring: Type.Object({
          status: Type.Optional(Type.Array(WorkflowRuntimeDataStatusSchema)),
          page: Type.Optional(Type.Number()),
          limit: Type.Optional(Type.Number()),
          orderBy: Type.Optional(
            Type.Union(
              [
                Type.Literal("workflowDefinitionName"),
                Type.Literal("status"),
                Type.Literal("state"),
                Type.Literal("assignee"),
                Type.Literal("resolvedAt"),
                Type.Literal("createdBy"),
                Type.Literal("createdAt")
              ]
            )),
          orderDirection: Type.Optional(SortOrderSchema)
        }),
        response: {
          200: Type.Object({
            results: Type.Array(
              Type.Composite(
                [
                  Type.Pick(
                    WorkflowRuntimeDataSchema,
                    [
                      "id",
                      "workflowDefinitionId",
                      "status",
                      "state",
                      "resolvedAt",
                      "createdBy",
                      "createdAt",
                      "updatedAt",
                      "context"
                    ]),
                  Type.Object({
                    workflowDefinitionName: TypeNullable(Type.String()),
                    assignee: TypeNullable(
                      Type.Pick(
                        WorkflowRuntimeDataSchema.properties.assignee,
                        ["id", "firstName", "lastName"]
                      )
                    )
                  })
                ]
              )
            ),
            meta: Type.Object({
              pages: Type.Number(),
              total: Type.Number()
            })
          }),
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
      const runtimeData = await workflowService.listRuntimeData({
        page: req.query.page,
        size: req.query.limit,
        status: req.query.status,
        orderBy: req.query.orderBy,
        orderDirection: req.query.orderDirection
      });

      return reply.send(runtimeData);
    }
  );

  // getWorkflowDefinitionById
  fastify.get("/workflow-definition/:id", {
      schema: {
        description: "Retrieve a workflow definition by its unique ID",
        tags: ["External", "Workflow"],
        params: Type.Object({
          id: Type.String({ description: "Unique ID of the workflow definition" })
        }),
        response: {
          200: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
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
        const workflowDefinition = await workflowService.getWorkflowDefinitionById(req.params.id);

        return reply.send(workflowDefinition);
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

  // getRunnableWorkflowById
  fastify.get("/:id", {
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
        const workflowRuntimeData = await workflowService.getWorkflowRuntimeDataById(req.params.id);
        const workflowDefinition = await workflowService.getWorkflowDefinitionById(
          workflowRuntimeData.workflowDefinitionId
        );

        return reply.send({
          workflowDefinition,
          workflowRuntimeData
        });
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

  // updateById
  fastify.patch("/:id", {
      schema: {
        description: "Update a workflow runtime data by its unique ID",
        tags: ["External", "Workflow"],
        params: Type.Object({
          id: Type.String({ description: "ID of the workflow runtime data" })
        }),
        body:
          Type.Partial(
            Type.Object({
              status: WorkflowRuntimeDataSchema.properties.status,
              context: WorkflowRuntimeDataSchema.properties.context,
              resolvedAt: WorkflowRuntimeDataSchema.properties.resolvedAt,
              state: TypeNoNull(WorkflowRuntimeDataSchema.properties.state),
              assigneeId: TypeNoNull(WorkflowRuntimeDataSchema.properties.assigneeId)
            }),
            {
              additionalProperties: false
            }
          ),
        response: {
          200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
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
      try {
        console.log("req.body", req.body);
        const workflowRuntimeData = await workflowService.updateWorkflowRuntimeData(req.params.id, req.body);

        return reply.send(workflowRuntimeData);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          return reply.status(StatusCodes.NOT_FOUND).send({
            status: getReasonPhrase(StatusCodes.NOT_FOUND),
            message: `No resource was found for ${JSON.stringify(req.params.id)}`
          });
        }

        throw err;
      }
    });

  // intent
  fastify.post("/intent", {
      schema: {
        description: "Retrieve a",
        tags: ["External", "Workflows"],
        body: Type.Object({
          entityId: Type.String({ description: "ID of the business or individual" }),
          intentName: Type.String({ description: "Name of the intent" })
        }, {
          additionalProperties: false
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
        // Rename to `intent` or `getRunnableWorkflowDataByIntent`?
        const entityType = req.body.intentName === "kycSignup" ? "endUser" : "business";
        const workflowRuntimeData = await workflowService.resolveIntent(req.body.intentName, req.body.entityId, entityType);

        return reply.status(201).send(workflowRuntimeData);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          return reply
            .status(StatusCodes.NOT_FOUND)
            .send({
              status: getReasonPhrase(StatusCodes.NOT_FOUND),
              message: `No resource was found for ${JSON.stringify(req.body)}`
            });
        }

        throw err;
      }
    });

  // createWorkflowRuntimeData
  fastify.post("/run", {
      schema: {
        description: "Creates or updates an entity and a workflow runtime data",
        tags: ["External", "Workflows"],
        body: Type.Composite([
          Type.Object({
            workflowId: Type.String({ description: "ID of the workflow" })
          }),
          Type.Pick(WorkflowRuntimeDataSchema, ["context", "config"])
        ], {
          additionalProperties: false
        }),
        response: {
          200: Type.Object({
            workflowDefinitionId: Type.String(),
            workflowRuntimeId: Type.String(),
            ballerineEntityId: Type.String({
              description: "ID of the business or individual"
            })
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
      const { workflowId, context, config } = req.body;
      const { entity } = context;

      if (!entity?.id && !entity?.ballerineEntityId)
        throw new BadRequestError("Entity id is required");

      const actionResult = await workflowService.createOrUpdateWorkflowRuntime({
        workflowDefinitionId: workflowId,
        context,
        config
      });

      return reply.send({
        workflowDefinitionId: actionResult[0].workflowDefinition.id,
        workflowRuntimeId: actionResult[0].workflowRuntimeData.id,
        ballerineEntityId: actionResult[0].ballerineEntityId
      });
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

  // sendEvent
  fastify.post("/:id/send-event", {
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
    },
    async (req, reply) => {
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

  // getWorkflowRuntimeDataContext
  fastify.get("/:id/context", {
      schema: {
        description: "Retrieve the context object of a workflow by the workflow's unique ID",
        tags: ["External", "Workflows"],
        params: Type.Object({
          id: Type.String({ description: "ID of the workflow" })
        }),
        response: {
          200: Type.Pick(WorkflowRuntimeDataSchema, ["context"]),
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
        const context = await workflowService.getWorkflowRuntimeDataContext(req.params.id);

        return reply.send({ context });
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }

        throw err;
      }
    });
};