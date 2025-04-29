import { DomainError } from '../../validators/domain.error';
import { ValueObject } from '../value-object';

export class Quantity extends ValueObject {
  public readonly value: number;

  constructor(value: number) {
    super();
    if (value < 0) {
      throw new DomainError('Quantity must be positive');
    }
    this.value = value;
  }

  public add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  public subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result <= 0) {
      throw new DomainError('Resulting quantity must be positive');
    }
    return new Quantity(result);
  }
}
