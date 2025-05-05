export abstract class SessionToken {
    abstract sign(data: object, secret: string, option?: object): Promise<string>;
    abstract verify(
      token: string,
      secret: string
    ): Promise<{ user_id: string; }>;
  }