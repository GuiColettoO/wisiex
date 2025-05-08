import { DomainError } from '../../../../@shared/domain/validators/domain.error';
import { Fee } from '../fee.vo';

describe('Fee Value Object Unit Tests', () => {
  test('should create a Fee with zero value', () => {
    const fee = new Fee(0);
    expect(fee.value).toBe(0);
  });

  test('should throw DomainError when initialized with a negative value', () => {
    expect(() => new Fee(-1)).toThrow(DomainError);
    expect(() => new Fee(-1)).toThrow('Fee must not be negative');
  });

  test('fromAmount: should calculate absolute fee from USD amount and rate', () => {
    const fee = Fee.fromAmount(1000, 0.005);
    expect(fee.value).toBeCloseTo(5);
  });

  test('makerOn: should apply MAKER_RATE correctly', () => {
    const fee = Fee.makerOn(1000);
    expect(fee.value).toBeCloseTo(1000 * Fee.MAKER_RATE);
  });

  test('takerOn: should apply TAKER_RATE correctly', () => {
    const fee = Fee.takerOn(2000);
    expect(fee.value).toBeCloseTo(2000 * Fee.TAKER_RATE);
  });
});