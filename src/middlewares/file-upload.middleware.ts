import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';
import {
  FileError,
  FileExtensionError,
  FileLimitError
} from '#/errors/classes.errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';

type TFileUploadMiddleware = {
  limits: { fileSize: number } & multer.Options['limits'];
  fileExtension: string;
  tempFolderPath: string;
  allowedExtensions: string[];
};

export const FileUploadMiddleware = ({
  limits,
  fileExtension,
  tempFolderPath,
  allowedExtensions
}: TFileUploadMiddleware): multer.Multer => {
  fs.accessSync(tempFolderPath);

  const upload = multer({
    limits,
    storage: multer.diskStorage({
      destination: (req, res, callback) => {
        callback(null, tempFolderPath);
      },
      filename(req, file, callback) {
        const filename = `${nanoid()}.${fileExtension}`;
        callback(null, filename);
      }
    }),
    fileFilter: (req, file, callback) => {
      const ext = path.extname(file.originalname).slice(1);

      if (!file || !allowedExtensions.includes(ext)) {
        callback(new FileExtensionError({ allowedExtensions }));
      }
      callback(null, true);
    }
  });

  const proxyUpload = new Proxy(upload, {
    get(target, prop: keyof multer.Multer) {
      const value = target[prop];
      type TArgs = Parameters<typeof value>;

      if (['single', 'array', 'fields', 'any', 'none'].includes(prop)) {
        return (...args: TArgs) => {
          return async (req: Request, res: Response, next: NextFunction) => {
            try {
              await new Promise<void>((resolve, reject) => {
                (target[prop] as (..._: TArgs) => RequestHandler)(...args)(
                  req,
                  res,
                  (error: unknown) => {
                    if (error) {
                      return reject(error);
                    }
                    resolve();
                  }
                );
              });

              if (prop !== 'none' && !(req.file || req.files)) {
                return next(
                  new FileError({
                    status: 400,
                    message: 'No file was uploaded in the expected field.'
                  })
                );
              }
            } catch (error) {
              // custom error handling
              if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                  return next(
                    new FileLimitError({ maxFileBytes: limits.fileSize })
                  );
                }
                return next(
                  new FileError({ status: 400, message: `${error.message}.` })
                );
              }
              return next(error);
            }
            return next();
          };
        };
      }
      return value;
    }
  });

  return proxyUpload;
};
