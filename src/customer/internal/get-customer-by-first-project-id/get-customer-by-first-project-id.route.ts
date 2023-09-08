import { CustomerRepository } from "@/customer/customer.repository";
import { db } from "@/db/client";
import { CustomerService } from "@/customer/customer.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { NotFoundError } from "@/common/errors/not-found-error";
import { getProjectIds } from "@/common/utils/get-project-ids/get-project-ids";
import {
  GetCustomerByFirstProjectIdRouteInternalSchema
} from "@/customer/internal/get-customer-by-first-project-id/get-customer-by-first-project-id.schema";

export const getCustomerByFirstProjectIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  const customerRepository = new CustomerRepository(
    db
  );
  const customerService = new CustomerService(
    customerRepository
  );

  app.route({
    method: "GET",
    url: "/",
    schema: GetCustomerByFirstProjectIdRouteInternalSchema,
    handler: async (req, reply) => {
      const projectIds = getProjectIds(req);
      const projectId = projectIds?.[0];

      if (!projectId) throw new NotFoundError('Customer not found');

      const customer = await customerService.getByProjectId(projectId, {
        select: {
          id: true,
          name: true,
          displayName: true,
          logoImageUri: true,
          country: true,
          language: true,
          customerStatus: true,
        },
      });

      return reply.send(customer)
    }
  });
};