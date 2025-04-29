import { Quantity } from '../quantity.vo';
import { DomainError } from '../../../validators/domain.error';

describe('Quantity Value Object Unit Tests', () => {
  test('should create a Quantity with a positive value', () => {
    const q = new Quantity(10);
    expect(q.value).toBe(10);
  });

  test('should allow zero quantity', () => {
    const q = new Quantity(0);
    expect(q.value).toBe(0);
  });

  test('should throw DomainError when initialized with a negative value', () => {
    expect(() => new Quantity(-5)).toThrow(DomainError);
    expect(() => new Quantity(-5)).toThrow('Quantity must be positive');
  });

  test('add(): should return a new Quantity with the sum of values', () => {
    const q1 = new Quantity(3);
    const q2 = new Quantity(7);
    const sum = q1.add(q2);
    expect(sum).toBeInstanceOf(Quantity);
    expect(sum.value).toBe(10);
    expect(q1.value).toBe(3);
    expect(q2.value).toBe(7);
  });

  test('subtract(): should return a new Quantity with the difference when result > 0', () => {
    const q1 = new Quantity(8);
    const q2 = new Quantity(3);
    const diff = q1.subtract(q2);
    expect(diff).toBeInstanceOf(Quantity);
    expect(diff.value).toBe(5);
    expect(q1.value).toBe(8);
    expect(q2.value).toBe(3);
  });

  test('subtract(): should throw DomainError when result is zero or negative', () => {
    const q = new Quantity(5);
    expect(() => q.subtract(new Quantity(5))).toThrow(DomainError);
    expect(() => q.subtract(new Quantity(5))).toThrow(
      'Resulting quantity must be positive'
    );
    expect(() => q.subtract(new Quantity(6))).toThrow(DomainError);
  });
});
