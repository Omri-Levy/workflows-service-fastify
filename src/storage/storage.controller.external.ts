import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { createFileRouteExternal } from "@/storage/external/create-file/create-file.route";
import { getFileByIdRouteExternal } from "@/storage/external/get-file-by-id/get-file-by-id.route";
import { getContentByIdExternalRoute } from "@/storage/external/get-content-by-id/get-content-by-id.route";

export const storageControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {
  
  await fastify.register(createFileRouteExternal);
  await fastify.register(getFileByIdRouteExternal);
  await fastify.register(getContentByIdExternalRoute);

};