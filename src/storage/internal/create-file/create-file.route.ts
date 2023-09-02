import { CreateFileRouteInternalSchema } from "@/storage/internal/create-file/create-file.schema";
import { manageFileByProvider } from "@/storage/get-file-storage-manager";
import { fileFilter } from "@/storage/file-filter";
import fastifyMulter from 'fastify-multer';
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { FileRepository } from "@/storage/storage.repository";
import { db } from "@/db/client";
import { StorageService } from "@/storage/storage.service";

export const createFileRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
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
    schema: CreateFileRouteInternalSchema,
    handler: async (req, reply) => {
      const { file } = req;
      const id = await storageService.createFileLink({
        uri: file.location || String(file.path),
        fileNameOnDisk: String(file.path),
        fileNameInBucket: file.key,
        userId: ""
      });

      return reply.status(201).send({ id });
    }
  });
};