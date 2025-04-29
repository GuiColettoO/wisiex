import { DomainError } from '../../../@shared/domain/validators/domain.error';

export class Fee {
  public readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new DomainError('Fee must not be negative');
    }
    this.value = value;
  }

  public toPercentage(): number {
    return this.value / 100;
  }

  public calculateOn(base: number): number {
    return base * this.toPercentage();
  }
}
