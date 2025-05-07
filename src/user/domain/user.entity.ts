import { EntityValidationError } from '../../@shared/domain/validators/validation.error';
import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { UserValidatorFactory } from './user.validator';
import { Balance } from './value-object/balance.vo';

type UserConstructorProps = {
  user_id?: Uuid;
  username: string;
  btc_balance: number;
  usd_balance: number;
  created_at?: Date;
  updated_at?: Date;
};

type UserCreateProps = {
  username: string;
  btc_balance: number;
  usd_balance: number;
};

type UserProps = UserCreateProps & {
  user_id: Uuid;
  created_at: Date;
  updated_at?: Date;
};

export class User {
  public user_id: Uuid;
  public username: string;
  private _btc_balance: Balance;
  private _usd_balance: Balance;
  public created_at: Date;
  public updated_at?: Date | null;

  constructor(props: UserConstructorProps) {
    this.user_id = props.user_id ?? new Uuid();
    this.username = props.username;
    this._btc_balance = new Balance(props.btc_balance);
    this._usd_balance = new Balance(props.usd_balance);
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? null;
  }

  static create(props: UserCreateProps): User {
    const user = new User(props);
    User.validate(user);
    return user;
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  public get btc_balance(): number {
    return this._btc_balance.value;
  }
  public get usd_balance(): number {
    return this._usd_balance.value;
  }

  public creditBtc(amount: number): void {
    this._btc_balance = this._btc_balance.credit(amount);
    this.updated_at = new Date();
  }

  public debitBtc(amount: number): void {
    this._btc_balance = this._btc_balance.debit(amount);
    this.updated_at = new Date();
  }

  public creditUsd(amount: number): void {
    this._usd_balance = this._usd_balance.credit(amount);
    this.updated_at = new Date();
  }

  public debitUsd(amount: number): void {
    this._usd_balance = this._usd_balance.debit(amount);
    this.updated_at = new Date();
  }

  static validate(entity: User) {
    const validator = UserValidatorFactory.create();
    const isValid = validator.validate(entity);
    if (!isValid) {
      throw new EntityValidationError(validator.errors!);
    }
  }

  toJSON() {
    return {
      user_id: this.user_id.id,
      username: this.username,
      btc_balance: this.btc_balance,
      usd_balance: this.usd_balance,
      created_at: this.created_at,
    };
  }
}
