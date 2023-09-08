import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { createCustomerRouteExternal } from "@/customer/external/create-customer/create-customer.route";
import { meRouteExternal } from "@/customer/external/me/me.route";

export const customerControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createCustomerRouteExternal);
  await fastify.register(meRouteExternal);

};
