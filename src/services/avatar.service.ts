import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

import { APP_URL } from '#config';
import {
  AVATAR_BACKGROUNDS_FOLDER,
  AVATAR_FILE_EXTENSION,
  AVATAR_SIZE,
  AVATARS_FOLDER,
  WATERMARK_FONT_PATH
} from '#/constants/avatar.constants';
import {
  TCreateDefaultAvatar,
  TSaveUserAvatar,
  TGetAvatarUrl,
  TCreateDefaultAvatarBackground,
  TDownloadAndSaveOAuthAvatar
} from '#/types/avatar.types';
import { HSVtoRGB } from '#/utils/hsv-to-rgb.utility';
import axios from 'axios';

export class AvatarService {
  static generateAvatarFilenames() {
    return {
      avatarFilename: `${nanoid()}.${AVATAR_FILE_EXTENSION}`,
      avatarBackgroundFilename: `${nanoid()}.${AVATAR_FILE_EXTENSION}`
    };
  }

  static getAvatarUrl({ avatarFilename }: TGetAvatarUrl) {
    return `${APP_URL}/api/avatars/${avatarFilename}`;
  }

  static async createDefaultAvatarBackground({
    avatarBackgroundFilename
  }: TCreateDefaultAvatarBackground) {
    const { r, g, b } = HSVtoRGB(Math.random(), 0.6, 0.6);

    const image = sharp({
      create: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        channels: 3,
        background: { r, g, b }
      }
    });

    // Генерация нескольких случайных цветных пятен
    const overlayImages = [];
    for (let i = 0; i < 12; i++) {
      const useCurrentColor = Math.random() > 0.6;
      let cr, cg, cb;
      let radius = Math.floor(Math.random() * 40) + 30;

      if (useCurrentColor) {
        // разбавить круглые пятна пятнами (меньшего размера) исходного цвета для интересных форм
        cr = r;
        cg = g;
        cb = b;
        radius /= 2.2;
      } else {
        const k = 0.22;
        cr =
          r +
          Math.floor(Math.random() > 0.5 ? Math.min(255 - r, r * k) : -r * k);
        cg =
          g +
          Math.floor(Math.random() > 0.5 ? Math.min(255 - g, g * k) : -g * k);
        cb =
          b +
          Math.floor(Math.random() > 0.5 ? Math.min(255 - b, b * k) : -b * k);
      }

      const cx = Math.floor(Math.random() * AVATAR_SIZE);
      const cy = Math.floor(Math.random() * AVATAR_SIZE);

      const circle = Buffer.from(
        `<svg width="${AVATAR_SIZE}" height="${AVATAR_SIZE}">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="rgb(${cr}, ${cg}, ${cb})" />
      </svg>`
      );

      overlayImages.push({ input: circle, blend: 'over' as const });
    }

    const overlayedImage = await image
      .composite(overlayImages)
      .toFormat(AVATAR_FILE_EXTENSION)
      .toBuffer();

    const avatarBackgroundFilepath = path.join(
      AVATAR_BACKGROUNDS_FOLDER,
      avatarBackgroundFilename
    );

    await sharp(overlayedImage)
      .blur(20)
      .toFormat(AVATAR_FILE_EXTENSION)
      .toFile(avatarBackgroundFilepath);
  }

  static async createDefaultAvatar({
    firstName,
    lastName,
    avatarFilename,
    avatarBackgroundFilename
  }: TCreateDefaultAvatar) {
    // использовать созданный для пользователя фон аватарки (один фон навсегда)
    const avatarBackgroundFilepath = path.join(
      AVATAR_BACKGROUNDS_FOLDER,
      avatarBackgroundFilename
    );

    const avatarFilepath = path.join(AVATARS_FOLDER, avatarFilename);

    const buffer = await fs.readFile(avatarBackgroundFilepath);

    // получить также символы unicode который имеет размер более 2 байты, например смайлик
    const firstLetter = [...firstName][0] || '',
      lastLetter = [...lastName][0] || '';

    const mark = `${firstLetter}${lastLetter}`;

    let fontSize = AVATAR_SIZE * 0.55;
    if (firstLetter.length && Buffer.from(firstLetter).length > 2) {
      fontSize -= AVATAR_SIZE * 0.1;
    }
    if (lastLetter.length && Buffer.from(lastLetter).length > 2) {
      fontSize -= AVATAR_SIZE * 0.1;
    }

    const svgText = `
      <svg width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" >
        <style>
          @font-face {
            font-family: 'Toys';
            src: url('${WATERMARK_FONT_PATH}');
          }
        </style>
        <text x="50%" y="50%" font-family="Toys" fill="white"  text-anchor="middle" font-size="${fontSize}" dy=".32em" >
          ${mark}
        </text>
      </svg>
    `;
    const textBuffer = Buffer.from(svgText);

    await sharp(buffer)
      .composite([{ input: textBuffer, blend: 'over' }])
      .toFile(avatarFilepath);
  }

  static async downloadAndSaveOAuthAvatar({
    avatarUrl,
    avatarFilename
  }: TDownloadAndSaveOAuthAvatar) {
    try {
      const response = await axios.get(avatarUrl, {
        responseType: 'arraybuffer'
      });

      const buffer = Buffer.from(response.data);

      const resizedAvatar = sharp(buffer)
        .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
        .toFormat(AVATAR_FILE_EXTENSION);

      const avatarFilepath = path.join(AVATARS_FOLDER, avatarFilename);

      await resizedAvatar.toFile(avatarFilepath);
      return true;
    } catch (_) {
      return false;
    }
  }

  static async saveUserAvatar({
    avatarFilename,
    avatarTempFilepath
  }: TSaveUserAvatar) {
    const buffer = await fs.readFile(avatarTempFilepath);
    await fs.unlink(avatarTempFilepath);

    const avatarFilepath = path.join(AVATARS_FOLDER, avatarFilename);

    const resizedAvatar = sharp(buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
      .toFormat(AVATAR_FILE_EXTENSION);

    await resizedAvatar.toFile(avatarFilepath);
  }
}
