import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { Trade } from '../trade.entity';

describe('Trade unit test', () => {
  describe('constructor', () => {
    test('should create a trade with default values', () => {
      const trade = new Trade({
        buy_order_id: new Uuid('037dc381-9c44-4b09-8801-fba1523c4d4b'),
        sell_order_id: new Uuid('24810312-b695-45d3-9828-c728b26472e6'),
        price: 10205.75,
        amount: 0.004,
      });
      console.log(trade)
      expect(trade.trade_id).toBeInstanceOf(Uuid);
      expect(trade.buy_order_id.id).toBe(
        '037dc381-9c44-4b09-8801-fba1523c4d4b'
      );
      expect(trade.sell_order_id.id).toBe(
        '24810312-b695-45d3-9828-c728b26472e6'
      );
      expect(trade.price.value).toBe(10205.75);
      expect(trade.amount.value).toBe(0.004);
      expect(trade.makerFee.value).toBe(0.2);
      expect(trade.takerFee.value).toBe(0.12);
    });
  });

  describe('create command', () => {
    test('should create a trade)', () => {
      const trade = Trade.create({
        buy_order_id: new Uuid('037dc381-9c44-4b09-8801-fba1523c4d4b'),
        sell_order_id: new Uuid('24810312-b695-45d3-9828-c728b26472e6'),
        price: 10205.75,
        amount: 0.004,
      });
      expect(trade.trade_id).toBeInstanceOf(Uuid);
      expect(trade.buy_order_id.id).toBe(
        '037dc381-9c44-4b09-8801-fba1523c4d4b'
      );
      expect(trade.sell_order_id.id).toBe(
        '24810312-b695-45d3-9828-c728b26472e6'
      );
      expect(trade.price.value).toBe(10205.75);
      expect(trade.amount.value).toBe(0.004);
      expect(trade.makerFee.value).toBe(0.20);
      expect(trade.takerFee.value).toBe(0.12);
    });
  });

  describe('trade_id field', () => {
    const arrange = [
      { trade_id: null },
      { trade_id: undefined },
      { trade_id: new Uuid() },
    ];

    test.each(arrange)('id = %j', ({ trade_id }) => {
      const trade = new Trade({
        trade_id: trade_id as any,
        buy_order_id: new Uuid('037dc381-9c44-4b09-8801-fba1523c4d4b'),
        sell_order_id: new Uuid('24810312-b695-45d3-9828-c728b26472e6'),
        price: 10205.75,
        amount: 0.004,
      });

      expect(trade.trade_id).toBeInstanceOf(Uuid);
      if (trade_id) {
        expect(trade.trade_id).toBe(trade_id);
      }
    });
  });
});
