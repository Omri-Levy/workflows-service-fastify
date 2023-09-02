import { NotFoundError } from "@/common/errors/not-found-error";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { GetFileByIdRouteExternalSchema } from "@/storage/external/get-file-by-id/get-file-by-id.schema";
import { FileRepository } from "@/storage/storage.repository";
import { db } from "@/db/client";
import { StorageService } from "@/storage/storage.service";

export const getFileByIdRouteExternal: FastifyPluginAsyncTypebox = async (app) => {
  const fileRepository = new FileRepository(
    db
  );
  const storageService = new StorageService(fileRepository);

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetFileByIdRouteExternalSchema,
    handler: async (req, reply) => {
      const id = req.params.id;
      const persistedFile = await storageService.getFileNameById({ id });

      if (!persistedFile) {
        throw new NotFoundError("file not found");
      }

      return reply.send(persistedFile);
    }
  });
};