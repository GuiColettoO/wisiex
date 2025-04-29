import { Sequelize } from 'sequelize-typescript';
import { TradeSequelizeRepository } from '../trade-sequelize.repository';
import { OrderModel } from '../../../order/infra/order.model';
import { Trade } from '../../domain/trade.entity';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { TradeModel } from '../trade.model';
import { UserModel } from '../../../user/infra/user.model';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../../../order/domain/enum/status-order.enum';

describe('TradeSequelizeRepository Integration Tests', () => {
  let repository: TradeSequelizeRepository;
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [TradeModel, OrderModel, UserModel],
      logging: false,
    });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    await UserModel.create({
      user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c7',
      username: 'Sample User',
      btc_balance: 1000,
      usd_balance: 5000,
      created_at: new Date(),
    });

    await OrderModel.create({
      order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c7',
      type: TypeOrder.BUY,
      price: 10205.75,
      amount: 0.004,
      filledAmount: 0,
      status: StatusOrder.OPEN,
      created_at: new Date(),
    });

    await OrderModel.create({
      order_id: '503f70eb-57a6-41a6-8ef6-b50dd4452942',
      user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c7',
      type: TypeOrder.SELL,
      price: 10205.75,
      amount: 0.004,
      filledAmount: 0,
      status: StatusOrder.OPEN,
      created_at: new Date(),
    });

    repository = new TradeSequelizeRepository(TradeModel);
  });

  test('should inserts a new entity', async () => {
    let trade = Trade.create({
      amount: 5000,
      makerFee: 5000,
      price: 5000,
      takerFee: 5000,
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
    });

    await repository.save(trade);
    let entity = await repository.findById(trade.trade_id);
    expect(entity.toJSON()).toStrictEqual(trade.toJSON());
  });

  test('should finds a entity by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();

    let trade = Trade.create({
      amount: 5000,
      makerFee: 5000,
      price: 5000,
      takerFee: 5000,
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
    });

    await repository.save(trade);
    entityFound = await repository.findById(trade.trade_id);
    expect(trade.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  test('should find recent trades up to limit', async () => {
    const first = Trade.create({
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
      price: 7000,
      amount: 0.003,
      makerFee: 0.5,
      takerFee: 0.3,
    });
    await repository.save(first);
    const second = Trade.create({
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
      price: 8000,
      amount: 0.004,
      makerFee: 0.5,
      takerFee: 0.3,
    });
    await repository.save(second);

    const recent = await repository.findRecent(1);
    expect(recent).toHaveLength(1);
    expect(recent[0].toJSON()).toStrictEqual(second.toJSON());
  });

  test('should find trades within a date range', async () => {
    const oldDate = new Date('2020-01-01T00:00:00Z');
    const oldTrade = Trade.reconstitute({
      trade_id: new Uuid(),
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
      price: 9000,
      amount: 0.005,
      makerFee: 0.5,
      takerFee: 0.3,
      executed_at: oldDate,
    });
    await repository.save(oldTrade);

    const recentTrade = Trade.create({
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
      price: 10000,
      amount: 0.006,
      makerFee: 0.5,
      takerFee: 0.3,
    });
    await repository.save(recentTrade);

    const from = new Date('2021-01-01T00:00:00Z');
    const to = new Date();
    const found = await repository.findByDateRange(from, to);

    expect(found).toHaveLength(1);
    expect(found[0].toJSON()).toStrictEqual(recentTrade.toJSON());
  });
});
