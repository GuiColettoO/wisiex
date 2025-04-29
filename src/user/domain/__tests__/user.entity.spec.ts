import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { User } from '../user.entity';

describe('User unit test', () => {
  let validateSpy: any;
  beforeEach(() => {
    validateSpy = jest.spyOn(User, 'validate');
  });

  describe('constructor', () => {
    test('should create a user with default values', () => {
      const user = new User({
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });
      expect(user.user_id).toBeInstanceOf(Uuid);
      expect(user.username).toBe('User Test');
      expect(user.btc_balance).toBe(10000);
      expect(user.usd_balance).toBe(10000);
    });
  });

  describe('create command', () => {
    test('should create a user)', () => {
      const user = User.create({
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });
      expect(user.user_id).toBeInstanceOf(Uuid);
      expect(user.username).toBe('User Test');
      expect(user.btc_balance).toBe(10000);
      expect(user.usd_balance).toBe(10000);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('user_id field', () => {
    const arrange = [
      { user_id: null },
      { user_id: undefined },
      { user_id: new Uuid() },
    ];

    test.each(arrange)('id = %j', ({ user_id }) => {
      const user = new User({
        user_id: user_id as any,
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });

      expect(user.user_id).toBeInstanceOf(Uuid);
      if (user_id) {
        expect(user.user_id).toBe(user_id);
      }
    });
  });

  describe('bussiness rules User', () => {
    test('should debit btc', () => {
      const user = User.create({
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });
      user.debitBtc(500);
      expect(user.btc_balance).toBe(9500);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should credit btc', () => {
      const user = User.create({
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });
      user.creditBtc(500);
      expect(user.btc_balance).toBe(10500);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should debit uds', () => {
      const user = User.create({
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });
      user.debitUsd(500);
      expect(user.usd_balance).toBe(9500);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
    test('should credit usd', () => {
      const user = User.create({
        username: 'User Test',
        btc_balance: 10000,
        usd_balance: 10000,
      });
      user.creditUsd(500);
      expect(user.usd_balance).toBe(10500);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Validator', () => {
    describe('create command', () => {
      test('should an invalid user with username, btc_balance, and usd_balance property', () => {
        const arrange = [];

        expect(() =>
          User.create({
            username: null,
            btc_balance: null,
            usd_balance: null,
          })
        ).containsErrorMessages({
          username: [
            'username should not be empty',
            'username must be a string',
          ],
          btc_balance: [
            'btc_balance should not be empty',
            'btc_balance must not be less than 0',
            'btc_balance must be a number conforming to the specified constraints',
          ],
          usd_balance: [
            'usd_balance should not be empty',
            'usd_balance must not be less than 0',
            'usd_balance must be a number conforming to the specified constraints',
          ],
        });

        expect(() =>
          User.create({
            username: '',
            btc_balance: '' as any,
            usd_balance: '' as any,
          })
        ).containsErrorMessages({
          username: ['username should not be empty'],
          btc_balance: [
            'btc_balance should not be empty',
            'btc_balance must not be less than 0',
            'btc_balance must be a number conforming to the specified constraints',
          ],
          usd_balance: [
            'usd_balance should not be empty',
            'usd_balance must not be less than 0',
            'usd_balance must be a number conforming to the specified constraints',
          ],
        });

        expect(() =>
          User.create({
            username: 5 as any,
            btc_balance: 5,
            usd_balance: 5,
          })
        ).containsErrorMessages({
          username: ['username must be a string'],
        });
      });
    });
  });
});
