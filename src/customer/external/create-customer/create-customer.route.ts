import { Customer, Prisma } from "@prisma/client";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { CustomerService } from "@/customer/customer.service";
import { CustomerRepository } from "@/customer/customer.repository";
import { db } from "@/db/client";
import { createDemoMockData } from "../../../../scripts/workflows/workflow-runtime";
import { CreateCustomerRouteExternalSchema } from "@/customer/external/create-customer/create-customer.schema";

export const createCustomerRouteExternal: FastifyPluginAsyncTypebox = async (app) => {
  const customerRepository = new CustomerRepository(
    db
  );
  const customerService = new CustomerService(
    customerRepository
  );

  app.route({
    method: "POST",
    url: "/",
    schema: CreateCustomerRouteExternalSchema,
    handler: async (req, reply) => {
      const { projectName, ...customer } = req.body;

      if (projectName) {
        (customer as Prisma.CustomerCreateInput).projects = {
          create: { name: projectName }
        };
      }

      const createdCustomer = (await customerService.create({
        data: customer,
        select: {
          id: true,
          name: true,
          displayName: true,
          logoImageUri: true,
          country: true,
          language: true,
          customerStatus: true,
          projects: true
        }
      })) as Customer & { projects: { id: string }[] };

      if (projectName == "demo") {
        await createDemoMockData({
          dbClient: db,
          customer: req.body,
          projects: createdCustomer.projects
        });
      }

      return reply.status(201).send(createdCustomer);
    }
  });
};