import { NotFoundError } from "@/common/errors/not-found-error";
import { FileRepository } from "@/storage/storage.repository";
import { db } from "@/db/client";
import { StorageService } from "@/storage/storage.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { GetFileByIdRouteInternalSchema } from "@/storage/internal/get-file-by-id/get-file-by-id.schema";

export const getFileByIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  const fileRepository = new FileRepository(
    db
  );
  const storageService = new StorageService(fileRepository);

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetFileByIdRouteInternalSchema,
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