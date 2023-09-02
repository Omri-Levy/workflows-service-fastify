import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { CreateEndUserRouteExternalSchema } from "@/end-user/external/create-end-user/create-end-user.schema";
import { faker } from "@faker-js/faker";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";

export const createEndUserRouteExternal: FastifyPluginAsyncTypebox = async (app) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(endUserRepository);

  app.route({
    method: "POST",
    url: "/",
    schema: CreateEndUserRouteExternalSchema,
    handler: async (req, reply) => {

      const { firstName, lastName } = req.body;
      const endUser = await endUserService.create({
        data: {
          firstName,
          lastName,
          correlationId: faker.datatype.uuid(),
          email: faker.internet.email(firstName, lastName),
          phone: faker.phone.number("+##########"),
          dateOfBirth: faker.date.past(60),
          avatarUrl: faker.image.avatar()
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true
        }
      });

      return reply.status(201).send(endUser);
    }
  });
};




