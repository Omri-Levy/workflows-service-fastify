import { DiskStorageOptions } from "fastify-multer/lib/interfaces";

export const getFileName: DiskStorageOptions['filename'] = (_req, _file, callback) => {
  const time = Math.floor(Date.now()).toString();
  callback(null, time);
};
