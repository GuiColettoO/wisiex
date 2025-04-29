import { DomainError } from '../../../@shared/domain/validators/domain.error';
import { ValueObject } from '../../../@shared/domain/value-objects/value-object';

export class Balance extends ValueObject {
  public readonly value: number;

  constructor(value: number) {
    super();
    if (value < 0) {
      throw new DomainError('Balance value must not be negative');
    }
    this.value = value;
  }

  public credit(amount: number): Balance {
    return new Balance(this.value + amount);
  }

  public debit(amount: number): Balance {
    const newValue = this.value - amount;
    if (newValue < 0) {
      throw new DomainError('Insufficient balance');
    }
    return new Balance(newValue);
  }
}
