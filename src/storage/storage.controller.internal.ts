import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { createFileRouteInternal } from "./internal/create-file/create-file.route";
import { getFileByIdRouteInternal } from "./internal/get-file-by-id/get-file-by-id.route";
import { getContentByIdRouteInternal } from "./internal/get-content-by-id/get-content-by-id.route";

export const storageControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createFileRouteInternal);
  await fastify.register(getFileByIdRouteInternal);
  await fastify.register(getContentByIdRouteInternal);

};