import { isRecordNotFoundError } from "@/db/db.util";
import { NotFoundError } from "@/common/errors/not-found-error"; // Replace with the actual import path
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { GetBusinessByIdRouteExternalSchema } from "@/business/external/get-business-by-id/get-business-by-id.schema";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { BusinessService } from "@/business/business.service";

export const getBusinessByIdRouteExternal: FastifyPluginAsyncTypebox = async (app) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(
    businessRepository
  );

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetBusinessByIdRouteExternalSchema,
    handler: async (req, reply) => {
      try {
        const business = await businessService.getById(req.params.id);

        return reply.send(business);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }

        throw err;
      }
    }
  });
};
