import { Price } from '../price.vo';
import { DomainError } from '../../../validators/domain.error';

describe('Price Value Object Unit Tests', () => {
  test('should create a Price with a positive value', () => {
    const price = new Price(100);
    expect(price.value).toBe(100);
  });

  test('should throw DomainError when initialized with zero', () => {
    expect(() => new Price(0)).toThrow(DomainError);
    expect(() => new Price(0)).toThrow('Price must be positive');
  });

  test('should throw DomainError when initialized with a negative value', () => {
    expect(() => new Price(-50)).toThrow(DomainError);
    expect(() => new Price(-50)).toThrow('Price must be positive');
  });
});
