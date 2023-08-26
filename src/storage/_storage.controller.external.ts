import { UploadedFile } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { downloadFileFromS3 } from "@/storage/get-file-storage-manager";
import { AwsS3FileConfig } from "@/providers/file/file-provider/aws-s3-file.config";
import * as os from "os";
import * as path from "path";
import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "@/common/errors/not-found-error";

// Temporarily identical to StorageControllerInternal
export class StorageControllerExternal {
  constructor(
    protected readonly service: StorageService,
    // protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
  ) {}

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
  async uploadFile(@UploadedFile() file: Partial<Express.MulterS3.File>) {
    const id = await this.service.createFileLink({
      uri: file.location || String(file.path),
      fileNameOnDisk: String(file.path),
      fileNameInBucket: file.key,
      // Probably wrong. Would require adding a relationship (Prisma) and using connect.
      userId: '',
    });

    return { id };
  }

  // curl -v http://localhost:3000/api/v1/storage/1679322938093
  async getFileById(req: FastifyRequest, reply: FastifyReply) {
    const id = request.params.id;
    // currently ignoring user id due to no user info
    const persistedFile = await this.service.getFileNameById({
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
    const persistedFile = await this.service.getFileNameById({
      id,
    });

    if (!persistedFile) {
      throw new NotFoundError('file not found');
    }

    if (persistedFile.fileNameInBucket) {
      const localFilePath = await downloadFileFromS3(
        AwsS3FileConfig.fetchBucketName(process.env) as string,
        persistedFile.fileNameInBucket,
      );

      return reply.sendFile(localFilePath, { root: '/' });
    } else {
      const root = path.parse(os.homedir()).root;

      return reply.sendFile(persistedFile.fileNameOnDisk, { root: root });
    }
  }
}
