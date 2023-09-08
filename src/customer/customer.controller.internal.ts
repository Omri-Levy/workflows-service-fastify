import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  getCustomerByFirstProjectIdRouteInternal
} from "@/customer/internal/get-customer-by-first-project-id/get-customer-by-first-project-id.route";

export const customerControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(getCustomerByFirstProjectIdRouteInternal);

};
