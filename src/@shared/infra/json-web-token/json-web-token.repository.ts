import jwt from "jsonwebtoken";
import { SessionToken } from "../../domain/json-web-token/session-token.entity";

export class JsonWebToken implements SessionToken {
  async sign(
    data: object,
    secret: string,
    option?: jwt.SignOptions
  ): Promise<string> {
    return jwt.sign(data, secret, option);
  }

  async verify(token: string): Promise<{
    user_id: string;
  }> {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      return {
        user_id: decoded.user_id,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}