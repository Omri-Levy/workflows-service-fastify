import { FileRepository } from './storage.repository';
import { IFileIds } from './types';
import { Prisma, File } from '@prisma/client';
import { HttpFileService } from "@/providers/file/file-provider/http-file.service";
import os from "os";
import { z } from "zod";

export class StorageService {
  constructor(protected readonly fileRepository: FileRepository) {}

  async createFileLink({
    uri,
    fileNameOnDisk,
    userId,
    fileNameInBucket,
  }: Pick<Prisma.FileCreateInput, 'uri' | 'fileNameOnDisk' | 'userId' | 'fileNameInBucket'>) {
    const file = await this.fileRepository.create({
      data: {
        uri,
        fileNameOnDisk,
        userId,
        fileNameInBucket,
      },
      select: {
        id: true,
      },
    });

    return file.id;
  }

  async getFileNameById({ id }: IFileIds) {
    return await this.fileRepository.findById({ id });
  }

  async downloadFileFromRemote(persistedFile: File) {
    const localeFilePath = `${os.tmpdir()}/${persistedFile.id}`;
    const downloadedFilePath = await new HttpFileService().downloadFile(
      persistedFile.uri,
      localeFilePath,
    );

    return downloadedFilePath;
  }

  isImageUrl(persistedFile: File) {
    return z.string().url().safeParse(persistedFile.uri).success;
  }
}
