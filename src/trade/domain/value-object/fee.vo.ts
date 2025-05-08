import { DomainError } from '../../../@shared/domain/validators/domain.error';

export class Fee {
  public readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new DomainError('Fee must not be negative');
    }
    this.value = value;
  }

 static readonly MAKER_RATE = 0.005;
  static readonly TAKER_RATE = 0.003;

  static fromAmount(amountUsd: number, rate: number): Fee {
    const raw = amountUsd * rate;
    const rounded = Math.round(raw * 100) / 100;
    return new Fee(rounded);
  }

  static makerOn(amountUsd: number): Fee {
    return Fee.fromAmount(amountUsd, Fee.MAKER_RATE);
  }

  static takerOn(amountUsd: number): Fee {
    return Fee.fromAmount(amountUsd, Fee.TAKER_RATE);
  }
}
