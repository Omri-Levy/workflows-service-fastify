import fastifyMulter from 'fastify-multer';
import { fileFilter } from "@/storage/file-filter";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { manageFileByProvider } from "@/storage/get-file-storage-manager";
import { CreateFileRouteExternalSchema } from "@/storage/external/create-file/create-file.schema";
import { FileRepository } from "@/storage/storage.repository";
import { db } from "@/db/client";
import { StorageService } from "@/storage/storage.service";

export const createFileRouteExternal: FastifyPluginAsyncTypebox = async (app) => {
  const fileRepository = new FileRepository(
    db
  );
  const storageService = new StorageService(fileRepository);

  app.route({
    method: "POST",
    url: "/",
    preHandler: fastifyMulter({
      // @ts-expect-error
      storage: manageFileByProvider(process.env),
      fileFilter
    }).single("file"),
    schema: CreateFileRouteExternalSchema,
    handler: async (req, reply) => {
      const { file } = req;
      const id = await storageService.createFileLink({
        uri: file.location || String(file.path),
        fileNameOnDisk: String(file.path),
        fileNameInBucket: file.key,
        // Probably wrong. Would require adding a relationship (Prisma) and using connect.
        userId: ""
      });

      return reply.send({ id });
    }
  });
};