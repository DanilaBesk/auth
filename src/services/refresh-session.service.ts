import { ipdata, redis } from '#/providers';
import {
  MAX_REFRESH_SESSIONS_FOR_USER,
  REFRESH_TOKEN_EXPIRES_IN
} from '#/constants/auth.constants';
import {
  TAddRefreshSession,
  TDeleteAllUserRefreshSessions,
  TDeleteRefreshSession,
  TGetAllUserRefreshSessions,
  TGetRefreshSession,
  TGetRefreshSessionKey,
  TGetRefreshSessionsInfo,
  TRefreshSession,
  TRefreshSessionInfo
} from '#/types/refresh-session.types';

export class RefreshSessionService {
  private static getRefreshSesionsKey({ userId }: TGetRefreshSessionKey) {
    return `refresh:${userId}`;
  }

  static async addRefreshSession({
    userId,
    refreshSessionId,
    tokenSignature,
    ua,
    ip
  }: TAddRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    const refreshSessions = await this.getAllUserRefreshSessions({ userId });
    const sessionsCount = Object.keys(refreshSessions).length;

    if (sessionsCount >= MAX_REFRESH_SESSIONS_FOR_USER) {
      const oldestSessionId = Object.entries(refreshSessions).reduce(
        (oldest, current) => {
          return current[1].createdAt < oldest[1].createdAt ? current : oldest;
        }
      )[0];

      await RefreshSessionService.deleteRefreshSession({
        userId,
        refreshSessionId: oldestSessionId
      });
      delete refreshSessions[oldestSessionId];
    }

    const refreshRecord: TRefreshSession = {
      tokenSignature,
      ip,
      ua,
      createdAt: Date.now()
    };

    await redis.hSet(
      refreshSessionsKey,
      refreshSessionId,
      JSON.stringify(refreshRecord)
    );
    redis.hExpire(
      refreshSessionsKey,
      refreshSessionId,
      REFRESH_TOKEN_EXPIRES_IN
    );
    // установка ttl для всего ключа, ведь время жизни всего ключа такое же, как и у последней добавленной сессии
    redis.expire(refreshSessionsKey, REFRESH_TOKEN_EXPIRES_IN);

    refreshSessions[refreshSessionId] = refreshRecord;

    return { refreshSessions };
  }

  static async getRefreshSession({
    userId,
    refreshSessionId
  }: TGetRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    const record = await redis.hGet(refreshSessionsKey, refreshSessionId);

    if (record !== undefined) {
      return JSON.parse(record) as TRefreshSession;
    }
    return record;
  }

  static async getAllUserRefreshSessions({
    userId
  }: TGetAllUserRefreshSessions) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    const refreshSessionsStr = await redis.hGetAll(refreshSessionsKey);

    const refreshSessions = Object.entries(refreshSessionsStr).reduce<
      Record<string, TRefreshSession>
    >((acc, [key, value]) => {
      acc[key] = JSON.parse(value) as TRefreshSession;
      return acc;
    }, {});

    return refreshSessions;
  }

  static async deleteRefreshSession({
    userId,
    refreshSessionId
  }: TDeleteRefreshSession) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    await redis.hDel(refreshSessionsKey, refreshSessionId);
  }

  static async deleteAllUserRefreshSessions({
    userId
  }: TDeleteAllUserRefreshSessions) {
    const refreshSessionsKey = this.getRefreshSesionsKey({ userId });

    await redis.del(refreshSessionsKey);
  }

  static async getRefreshSessionsInfo({
    refreshSessions
  }: TGetRefreshSessionsInfo): Promise<TRefreshSessionInfo[]> {
    const refreshSessionsInfo = Promise.all(
      Object.entries(refreshSessions).map(
        async ([refreshSessionId, session]) => {
          const { ip, ua, createdAt } = session;
          const ipData = await ipdata.getIPData(session.ip);

          return { refreshSessionId, ip, ua, ipData, createdAt };
        }
      )
    );
    return refreshSessionsInfo;
  }
}
