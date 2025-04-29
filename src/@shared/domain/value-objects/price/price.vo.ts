import { DomainError } from '../../validators/domain.error';
import { ValueObject } from '../value-object';

export class Price extends ValueObject {
  public readonly value: number;

  constructor(value: number) {
    super();
    if (value <= 0) {
      throw new DomainError('Price must be positive');
    }
    this.value = value;
  }
}
