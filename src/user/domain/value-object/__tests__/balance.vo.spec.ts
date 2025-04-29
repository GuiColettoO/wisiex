import { DomainError } from '../../../../@shared/domain/validators/domain.error';
import { Balance } from '../balance.vo';

describe('Balance Value Object Unit Tests', () => {
  test('should create a Balance with a positive value', () => {
    const balance = new Balance(100);
    expect(balance.value).toBe(100);
  });

  test('should allow zero balance', () => {
    const balance = new Balance(0);
    expect(balance.value).toBe(0);
  });

  test('should throw DomainError when initialized with a negative value', () => {
    expect(() => new Balance(-10)).toThrow(DomainError);
    expect(() => new Balance(-10)).toThrow(
      'Balance value must not be negative'
    );
  });

  test('credit: should return a new Balance with increased value', () => {
    const balance = new Balance(50);
    const credited = balance.credit(25);
    expect(credited).toBeInstanceOf(Balance);
    expect(credited.value).toBe(75);

    expect(balance.value).toBe(50);
  });

  test('debit: should return a new Balance with decreased value', () => {
    const balance = new Balance(80);
    const debited = balance.debit(30);
    expect(debited).toBeInstanceOf(Balance);
    expect(debited.value).toBe(50);

    expect(balance.value).toBe(80);
  });

  test('debit: should allow draining to zero', () => {
    const balance = new Balance(40);
    const debited = balance.debit(40);
    expect(debited.value).toBe(0);
  });

  test('debit: should throw DomainError when amount exceeds balance', () => {
    const balance = new Balance(20);
    expect(() => balance.debit(21)).toThrow(DomainError);
    expect(() => balance.debit(21)).toThrow('Insufficient balance');
  });
});
