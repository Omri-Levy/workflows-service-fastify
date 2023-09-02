import { isRecordNotFoundError } from "@/db/db.util";
import { NotFoundError } from "@/common/errors/not-found-error";
import { GetBusinessByIdRouteInternalSchema } from "./get-business-by-id.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { BusinessService } from "@/business/business.service";

export const getBusinessByIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(businessRepository);

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetBusinessByIdRouteInternalSchema,
    handler: async (req, reply) => {
      try {
        const business = await businessService.getById(req.params?.id);

        return reply.send(business);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params?.id)}`);
        }

        throw err;
      }
    }
  });
};