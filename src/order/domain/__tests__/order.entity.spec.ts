import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../enum/status-order.enum';
import { DomainError } from '../../../@shared/domain/validators/domain.error';
import { Order } from '../order.entity';

describe('Order unit test', () => {
  let validateSpy: jest.SpyInstance;

  beforeEach(() => {
    validateSpy = jest.spyOn(Order, 'validate');
  });

  describe('constructor', () => {
    test('should create an Order with default values', () => {
      const userId = new Uuid('037dc381-9c44-4b09-8801-fba1523c4d4b');
      const order = new Order({
        user_id: userId,
        type: TypeOrder.BUY,
        price: 10205.75,
        amount: 0.004,
      });

      expect(order.order_id).toBeInstanceOf(Uuid);
      expect(order.user_id.id).toBe(userId.id);
      expect(order.type).toBe(TypeOrder.BUY);
      expect(order.price.value).toBeCloseTo(10205.75);
      expect(order.amount.value).toBeCloseTo(0.004);
      expect((order as any).filledAmount.value).toBe(0);
      expect((order as any).status).toBe(StatusOrder.OPEN);
      expect(order.created_at).toBeInstanceOf(Date);
      expect((order as any).updated_at).toBeNull();
    });
  });

  describe('create command', () => {
    test('should call validate and create Order', () => {
      const order = Order.create({
        user_id: new Uuid('24810312-b695-45d3-9828-c728b26472e6'),
        type: TypeOrder.SELL,
        price: 9800,
        amount: 0.5,
      });

      expect(order.order_id).toBeInstanceOf(Uuid);
      expect(order.type).toBe(TypeOrder.SELL);
      expect(order.price.value).toBe(9800);
      expect(order.amount.value).toBe(0.5);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('reconstitute', () => {
    test('should reconstitute and validate Order', () => {
      const id = new Uuid();
      const userId = new Uuid();
      const createdAt = new Date('2025-04-20T10:00:00Z');
      const updatedAt = new Date('2025-04-21T11:00:00Z');

      const order = Order.reconstitute({
        order_id: id,
        user_id: userId,
        type: TypeOrder.BUY,
        price: 12000,
        amount: 1.2,
        filledAmount: 0.3,
        status: StatusOrder.PARTIAL,
        created_at: createdAt,
        updated_at: updatedAt,
      });

      expect(order.order_id).toBe(id);
      expect(order.user_id).toBe(userId);
      expect(order.price.value).toBe(12000);
      expect(order.amount.value).toBe(1.2);
      expect(order.filledAmount.value).toBe(0.3);
      expect(order.status).toBe(StatusOrder.PARTIAL);
      expect(order.created_at).toBe(createdAt);
      expect(order.updated_at).toBe(updatedAt);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('fill method', () => {
    test('should partially fill an open order', () => {
      const order = Order.create({
        user_id: new Uuid(),
        type: TypeOrder.SELL,
        price: 15000,
        amount: 2,
      });

      order.fill(0.5);
      expect(order.filledAmount.value).toBeCloseTo(0.5);
      expect(order.status).toBe(StatusOrder.PARTIAL);
      expect(order.updated_at).toBeInstanceOf(Date);
    });

    test('should fully fill an order', () => {
      const order = Order.create({
        user_id: new Uuid(),
        type: TypeOrder.BUY,
        price: 15000,
        amount: 1,
      });

      order.fill(1);
      expect((order as any).filledAmount.value).toBeCloseTo(1);
      expect((order as any).status).toBe(StatusOrder.FILLED);
    });

    test('should not allow overfill', () => {
      const order = Order.create({
        user_id: new Uuid(),
        type: TypeOrder.BUY,
        price: 15000,
        amount: 1,
      });
      expect(() => order.fill(2)).toThrow(DomainError);
    });

    test('should not allow fill on cancelled order', () => {
      const order = Order.create({
        user_id: new Uuid(),
        type: TypeOrder.BUY,
        price: 15000,
        amount: 1,
      });
      order.cancel();
      expect(() => order.fill(0.5)).toThrow(DomainError);
    });
  });

  describe('cancel method', () => {
    test('should cancel an open order', () => {
      const order = Order.create({
        user_id: new Uuid(),
        type: TypeOrder.SELL,
        price: 20000,
        amount: 0.2,
      });
      order.cancel();
      expect((order as any).status).toBe(StatusOrder.CANCELLED);
    });

    test('should not cancel a filled order', () => {
      const order = Order.create({
        user_id: new Uuid(),
        type: TypeOrder.SELL,
        price: 20000,
        amount: 0.2,
      });
      order.fill(0.2);
      expect(() => order.cancel()).toThrow(Error);
    });
  });
});
