import { BCRYPT_SALT_ROUNDS, DEFAULT_ROLE } from '#/constants/auth.constants';
import { UserEmailConflictError } from '#/errors/api-error';
import { prisma } from '#/providers/prisma.provider';
import { TRegistration } from '#/types/user.types';
import { hashSync } from 'bcrypt';
import { Activation } from './activation.service';
import { TokenService } from './token.service';

export class UserService {
  static async registration({
    code,
    email,
    fingerprint,
    password,
    ua,
    ip
  }: TRegistration) {
    const candidate = await prisma.user.findUnique({ where: { email } });
    if (candidate) {
      throw new UserEmailConflictError();
    }

    await Activation.verifyActivationCode({ email, code });

    const hashPassword = hashSync(password, BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashPassword, role: DEFAULT_ROLE }
    });

    const tokenPayload = {
      email: user.email,
      id: user.id,
      role: user.role
    };

    const accessToken = TokenService.makeAccessToken(tokenPayload);
    const refreshUUID = TokenService.makeRefreshUUID();

    await TokenService.saveRefreshToken({});
  }
}

// const tokens = tokenService.generateTokens({ ...userDto });
// await tokenService.saveToken(userDto.id, tokens.refreshToken);

// return {
//   ...tokens,
//   user: userDto
// };

// async login({ email, password }) {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw ApiError.BadRequest(
//       'Непредвиденная ошибка: пользователь не существует с таким email'
//     );
//   }
//   const isPassEquals = await bcrypt.compare(password, user.password);
//   if (!isPassEquals) {
//     throw ApiError.BadRequest('Неверный пароль');
//   }
//   const userDto = new UserDto(user);
//   const tokens = tokenService.generateTokens({ ...userDto });
//   await tokenService.saveToken(user._id, tokens.refreshToken);

//   return { ...tokens, user: userDto };
// }

// async logout(refreshToken) {
//   await tokenService.removeToken(refreshToken);
// }
// async refresh(refreshToken) {
//   if (!refreshToken) {
//     throw ApiError.UnauthorizedError();
//   }
//   const userData = tokenService.validateRefreshToken(refreshToken);
//   const tokenFromDb = await tokenService.findToken(refreshToken);
//   if (!userData || !tokenFromDb) throw ApiError.UnauthorizedError();

//   const user = await User.findById(userData.id);
//   const userDto = new UserDto(user);
//   const tokens = tokenService.generateTokens({ ...userDto });

//   await tokenService.saveToken(userDto.id, tokens.refreshToken);
//   return { ...tokens, user: userDto };
// }
