export type TGetAvatarUrl = {
  avatarFilename: string;
};

export type TCreateDefaultAvatarBackground = {
  avatarBackgroundFilename: string;
};

export type TCreateDefaultAvatar = {
  firstName: string;
  lastName: string;
  avatarFilename: string;
  avatarBackgroundFilename: string;
};

export type TDownloadAndSaveOAuthAvatar = {
  avatarUrl: string;
  avatarFilename: string;
};

export type TSaveUserAvatar = {
  avatarFilename: string;
  avatarTempFilepath: string;
};
