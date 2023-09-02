import { NotFoundError } from "@/common/errors/not-found-error";
import { downloadFileFromS3 } from "@/storage/get-file-storage-manager";
import { AwsS3FileConfig } from "@/providers/file/file-provider/aws-s3-file.config";
import { GetContentByIdRouteInternalSchema } from "@/storage/internal/get-content-by-id/get-content-by-id.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { FileRepository } from "@/storage/storage.repository";
import { db } from "@/db/client";
import { StorageService } from "@/storage/storage.service";
import path from "path";
import os from "os";
import fs from "fs";

export const getContentByIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  const fileRepository = new FileRepository(
    db
  );
  const storageService = new StorageService(fileRepository);

  app.route({
    method: "GET",
    url: "/content/:id",
    schema: GetContentByIdRouteInternalSchema,
    handler: async (req, reply) => {
      const id = req.params.id;
      const persistedFile = await storageService.getFileNameById({ id });
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
    }
  });
};