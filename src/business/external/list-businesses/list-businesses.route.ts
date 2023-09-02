import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ListBusinessesRouteExternalSchema } from "./list-businesses.schema";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { BusinessService } from "@/business/business.service";

export const listBusinessesRouteExternal: FastifyPluginAsyncTypebox = async (app) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(
    businessRepository
  );

  app.route({
    method: "GET",
    url: "/",
    schema: ListBusinessesRouteExternalSchema,
    handler: async (req, reply) => {
      const businesses = await businessService.list(req.query);
      return reply.send(businesses);
    }
  });
};