import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ClassValidatorFields } from '../../@shared/domain/validators/class-validator-fields';
import { User } from './user.entity';

export class UserRules {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  btc_balance!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  usd_balance!: number;

  constructor({ username, btc_balance, usd_balance }: User) {
    Object.assign(this, {
      username,
      btc_balance,
      usd_balance,
    });
  }
}

export class UserValidator extends ClassValidatorFields<UserRules> {
  validate(entity: User) {
    return super.validate(new UserRules(entity));
  }
}

export class UserValidatorFactory {
  static create() {
    return new UserValidator();
  }
}
