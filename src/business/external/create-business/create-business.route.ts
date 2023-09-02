import { db } from "@/db/client";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { BusinessRepository } from "@/business/business.repository";
import { BusinessService } from "@/business/business.service";
import { CreateBusinessRouteExternalSchema } from "./create-business.schema";

export const createBusinessRouteExternal: FastifyPluginAsyncTypebox = async (app) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(
    businessRepository
  );

  app.route({
    method: "POST",
    url: "/",
    schema: CreateBusinessRouteExternalSchema,
    handler: async (req, reply) => {
      const business = await businessService.create({
        data: {
          ...req.body,
          legalForm: "name",
          countryOfIncorporation: "US",
          address: "address",
          industry: "telecom",
          documents: "s"
        },
        select: {
          id: true,
          companyName: true
        }
      });

      return reply.status(201).send(business);
    }
  });
};
