import { DomainError } from '../../../../@shared/domain/validators/domain.error';
import { Fee } from '../fee.vo';

describe('Fee Value Object Unit Tests', () => {
  test('should create a Fee with zero value', () => {
    const fee = new Fee(0);
    expect(fee.toPercentage()).toBe(0);
  });

  test('should create a Fee with positive value', () => {
    const fee = new Fee(10);
    expect(fee.toPercentage()).toBe(0.1);
  });

  test('should throw DomainError when initialized with a negative value', () => {
    expect(() => new Fee(-5)).toThrow(DomainError);
    expect(() => new Fee(-5)).toThrow('Fee must not be negative');
  });

  test('toPercentage: should return value / 100', () => {
    const fee = new Fee(25);
    expect(fee.toPercentage()).toBe(0.25);
  });

  test('calculateOn: should return base * (value / 100)', () => {
    const fee = new Fee(5);
    expect(fee.calculateOn(200)).toBe(10);

    expect(fee.toPercentage()).toBe(0.05);
  });
});
