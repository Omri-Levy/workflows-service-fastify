import { StorageService } from "./storage.service";
import { downloadFileFromS3 } from "@/storage/get-file-storage-manager";
import { AwsS3FileConfig } from "@/providers/file/file-provider/aws-s3-file.config";
import path from "path";
import os from "os";
import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "@/common/errors/not-found-error";

export class StorageControllerInternal {
  constructor(
    protected readonly storageService: StorageService,
    // protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
  ) {}

  // curl -v -F "file=@a.jpg" http://localhost:3000/api/v1/storage
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: manageFileByProvider(process.env),
  //     fileFilter,
  //   }),
  // )
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  async uploadFile(file: Partial<Express.MulterS3.File>) {
    const id = await this.storageService.createFileLink({
      uri: file.location || String(file.path),
      fileNameOnDisk: String(file.path),
      fileNameInBucket: file.key,
      // Probably wrong. Would require adding a relationship (Prisma) and using connect.
      userId: '',
    });

    return { id };
  }

  // curl -v http://localhost:3000/api/v1/internal/storage/1679322938093
  async getFileById(req: FastifyRequest, reply: FastifyReply) {
    const id = request.params.id;
    // currently ignoring user id due to no user info
    const persistedFile = await this.storageService.getFileNameById({
      id,
    });
    if (!persistedFile) {
      throw new NotFoundError('file not found');
    }

    return reply.send(persistedFile);
  }

  // curl -v http://localhost:3000/api/v1/storage/content/1679322938093
  async fetchFileContent(req: FastifyRequest, reply: FastifyReply) {
    const id = request.params.id;
    // currently ignoring user id due to no user info
    const persistedFile = await this.storageService.getFileNameById({
      id,
    });

    if (!persistedFile) {
      throw new NotFoundError('file not found');
    }
    const root = path.parse(os.homedir()).root;

    if (persistedFile.fileNameInBucket) {
      const localFilePath = await downloadFileFromS3(
        AwsS3FileConfig.fetchBucketName(process.env) as string,
        persistedFile.fileNameInBucket,
      );
      return reply.sendFile(localFilePath, { root: '/' });
    } else if (this.storageService.isImageUrl(persistedFile)) {
      const downloadFilePath = await this.storageService.downloadFileFromRemote(persistedFile);
      return reply.sendFile(downloadFilePath, { root: root });
    } else {
      return reply.sendFile(persistedFile.fileNameOnDisk, { root: root });
    }
  }

}
