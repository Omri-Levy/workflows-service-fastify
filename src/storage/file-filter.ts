import { FileFilter } from "fastify-multer/lib/interfaces";


export const fileFilter: FileFilter = (req, file, callback) => {
  const MAX_FILE_SIZE = 1024;
  if (file?.size && file?.size >= MAX_FILE_SIZE) {
    return callback(new Error(`File size exceeded ${MAX_FILE_SIZE}`), false);
  }
  if (!file.originalname.match(/\.(jpg|jpeg|svg|png|gif|pdf|txt)$/)) {
    return callback(new Error("Only image files are allowed!"), false);
  }
  callback(null, true);
};
