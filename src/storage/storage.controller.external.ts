import { db } from "@/db/client";
import { StorageService } from "@/storage/storage.service";
import { FileRepository } from "@/storage/storage.repository";
import path from "path";
import os from "os";
import { downloadFileFromS3, manageFileByProvider } from "@/storage/get-file-storage-manager";
import { AwsS3FileConfig } from "@/providers/file/file-provider/aws-s3-file.config";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import multer from "fastify-multer";
import { fileFilter } from "@/storage/file-filter";
import fs from "fs";
import { NotFoundError } from "@/common/errors/not-found-error";

export const storageControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const fileRepository = new FileRepository(
    db
  );
  const storageService = new StorageService(fileRepository);

  fastify.route({
    method: "POST",
    url: "/",
    preHandler: multer({
      // @ts-expect-error
      storage: manageFileByProvider(process.env),
      fileFilter
    }).single("file"),
    schema: Type.Object({
      response: Type.Object({
        200: Type.Object({
          id: Type.String()
        })
      })
    }),
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

  fastify.get("/:id", {
    schema: {
      params: Type.Object({
        id: Type.String()
      })
    }
  }, async (req, reply) => {
    const id = req.params.id;
    // currently ignoring user id due to no user info
    const persistedFile = await storageService.getFileNameById({
      id
    });
    if (!persistedFile) {
      throw new NotFoundError("file not found");
    }

    return reply.send(persistedFile);
  });

  fastify.get("/content/:id", {
    schema: {
      params: Type.Object({
        id: Type.String()
      })
    }
  }, async (req, reply) => {
    const id = req.params.id;
    // currently ignoring user id due to no user info
    const persistedFile = await storageService.getFileNameById({
      id
    });
    const root = path.parse(os.homedir()).root;
    let filePath;

    if (!persistedFile) {
      throw new NotFoundError("file not found");
    }

    if (persistedFile.fileNameInBucket) {
      const localFilePath = await downloadFileFromS3(
        AwsS3FileConfig.fetchBucketName(process.env) as string,
        persistedFile.fileNameInBucket
      );

      filePath = path.join("/", localFilePath);
    }

    if (storageService.isImageUrl(persistedFile)) {
      const downloadFilePath = await storageService.downloadFileFromRemote(persistedFile);

      filePath = path.join(root, downloadFilePath);
    }

    if (!filePath) {
      filePath = path.join(root, persistedFile.fileNameOnDisk);
    }

    const stream = fs.createReadStream(filePath);

    return reply.type("application/octet-stream").send(stream);
  });

};