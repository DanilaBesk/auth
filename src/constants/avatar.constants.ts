import path from 'path';
import { fileURLToPath } from 'url';

export const AVATAR_SIZE = 200;

export const WATERMARK_FONT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'fonts',
  'TOYZ.ttf'
);

export const AVATARS_FOLDER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'uploads',
  'avatars'
);

export const AVATARS_TEMP_FOLDER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'uploads',
  'temp',
  'avatars'
);

export const AVATAR_BACKGROUNDS_FOLDER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'uploads',
  'avatar-backgrounds'
);

export const AVATAR_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const AVATAR_ALLOWED_EXTENSIONS = [
  'jpeg',
  'jpg',
  'png',
  'webp',
  'tiff',
  'tif'
];
export const AVATAR_FILE_EXTENSION = 'png';
