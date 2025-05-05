import dotenv from 'dotenv';
import { IUserRepository } from '../domain/user.interface.repository';
import { User } from '../domain/user.entity';
import { JsonWebToken } from '../../@shared/infra/json-web-token/json-web-token.repository';


dotenv.config();

export class SignInUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {

    const secret = process.env.JSON_WEB_TOKEN_SECRET || 'fFF%&^SDFF^&SF$FD$SFDF^&*^&5ds4f56sd47';

    let user = await this.userRepo.findByUsername(input.username);

    if (!user) {
        user = User.create({
            username: input.username,
            btc_balance: 100,
            usd_balance:  100000
        })
       await this.userRepo.save(user)
    }

    const jwt = new JsonWebToken();

    const access_token = await jwt.sign(
      {
        user_id: user.user_id,
      },
      secret,
      { expiresIn: 3600 }
    );


    return {
      access_token,
    };
  }
}

type SignInInput = {
  username: string;
};

type SignInOutput = {
  access_token: string;
};