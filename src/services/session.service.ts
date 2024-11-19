import {
  MAX_SESSIONS_FOR_USER,
  REFRESH_TOKEN_EXPIRES_IN
} from '#/constants/auth.constants';
import { ipdata, redis } from '#/providers';
import {
  TCreateSession,
  TDeleteAllUserSessions,
  TDeleteSession,
  TGetAllUserSessions,
  TGetSession,
  TGetUserSessionsInfo,
  TGetUserSessionsKey,
  TSession,
  TSessionInfo
} from '#/types/session.types';

export class SessionService {
  private static getUserSessionsKey({ userId }: TGetUserSessionsKey) {
    return `user-sessions:${userId}`;
  }

  static async createSession({
    userId,
    sessionId,
    tokenSignature,
    ua,
    ip
  }: TCreateSession) {
    const userSessionsKey = this.getUserSessionsKey({ userId });

    const sessions = await this.getAllUserSessions({ userId });
    const sessionsCount = Object.keys(sessions).length;

    if (sessionsCount >= MAX_SESSIONS_FOR_USER) {
      const oldestSessionId = Object.entries(sessions).reduce(
        (oldest, current) => {
          return current[1].createdAt < oldest[1].createdAt ? current : oldest;
        }
      )[0];

      await this.deleteSession({
        userId,
        sessionId: oldestSessionId
      });
      delete sessions[oldestSessionId];
    }

    const record: TSession = {
      tokenSignature,
      ip,
      ua,
      createdAt: Date.now()
    };

    await redis.hSet(userSessionsKey, sessionId, JSON.stringify(record));
    await Promise.all([
      redis.hExpire(userSessionsKey, sessionId, REFRESH_TOKEN_EXPIRES_IN),

      // установка ttl для всего ключа, ведь время жизни всего ключа такое же, как и у последней добавленной сессии
      redis.expire(userSessionsKey, REFRESH_TOKEN_EXPIRES_IN)
    ]);

    sessions[sessionId] = record;

    return { sessions };
  }

  static async getSession({ userId, sessionId }: TGetSession) {
    const userSessionsKey = this.getUserSessionsKey({ userId });

    const record = await redis.hGet(userSessionsKey, sessionId);

    if (!record) {
      return null;
    }

    return JSON.parse(record) as TSession;
  }

  static async getAllUserSessions({ userId }: TGetAllUserSessions) {
    const userSessionsKey = this.getUserSessionsKey({ userId });

    const sessionsStr = await redis.hGetAll(userSessionsKey);

    const sessions = Object.entries(sessionsStr).reduce<
      Record<string, TSession>
    >((acc, [key, value]) => {
      acc[key] = JSON.parse(value) as TSession;
      return acc;
    }, {});

    return sessions;
  }

  static async deleteSession({ userId, sessionId }: TDeleteSession) {
    const userSessionsKey = this.getUserSessionsKey({ userId });

    await redis.hDel(userSessionsKey, sessionId);
  }

  static async deleteAllUserSessions({ userId }: TDeleteAllUserSessions) {
    const userSessionsKey = this.getUserSessionsKey({ userId });

    await redis.del(userSessionsKey);
  }

  static async getUserSessionsInfo({
    sessions
  }: TGetUserSessionsInfo): Promise<TSessionInfo[]> {
    const sessionsInfo = Promise.all(
      Object.entries(sessions).map(async ([sessionId, session]) => {
        const { ip, ua, createdAt } = session;
        const ipData = await ipdata.getIPData(session.ip);

        return { sessionId, ip, ua, ipData, createdAt };
      })
    );
    return sessionsInfo;
  }
}
