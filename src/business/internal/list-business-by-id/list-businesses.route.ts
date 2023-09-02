import { InputJsonValue } from "@/types";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ListBusinessesRouteInternalSchema } from "@/business/internal/list-business-by-id/list-businesses.schema";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { BusinessService } from "@/business/business.service";

export const listBusinessesRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(businessRepository);

  app.route({
    method: "GET",
    url: "/",
    schema: ListBusinessesRouteInternalSchema,
    handler: async (req, reply) => {
      const query: InputJsonValue = {};
      const businesses = await businessService.list({
        ...req.query,
        ...query
      });

      return reply.send(businesses);
    }
  });
};