import { Sequelize } from 'sequelize-typescript';
import { UserModel } from '../../../user/infra/user.model';
import { TradeModel } from '../trade.model';
import { OrderModel } from '../../../order/infra/order.model';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../../../order/domain/enum/status-order.enum';
import { TradeModelMapper } from '../trade-model.mapper';
import { Trade } from '../../domain/trade.entity';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';

describe('TradeModelMapper Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel, TradeModel, OrderModel],
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
  });

  test('should convert a trade model to a trade aggregate', () => {
    const date = new Date();

    const model = TradeModel.build({
      trade_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      price: 10205.75,
      amount: 0.004,
      makerFee: 0.5,
      takerFee: 0.3,
      executed_at: date,
      buy_order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      sell_order_id: '503f70eb-57a6-41a6-8ef6-b50dd4452942',
    });

    const aggregate = TradeModelMapper.toEntity(model);

    expect(aggregate.toJSON()).toStrictEqual(
      new Trade({
        trade_id: new Uuid('9366b7dc-2d71-4799-b91c-c64adb205104'),
        price: 10205.75,
        amount: 0.004,
        makerFee: 0.5,
        takerFee: 0.3,
        executed_at: date,
        buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
        sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
      }).toJSON()
    );
  });

  test('should convert a trade aggregate to a trade model', () => {
    const date = new Date();
    const aggregate = new Trade({
      trade_id: new Uuid('9366b7dc-2d71-4799-b91c-c64adb205104'),
      price: 10205.75,
      amount: 0.004,
      makerFee: 0.5,
      takerFee: 0.3,
      executed_at: date,
      buy_order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      sell_order_id: new Uuid('503f70eb-57a6-41a6-8ef6-b50dd4452942'),
    });

    const model = TradeModelMapper.toModel(aggregate);

    expect(model.toJSON()).toStrictEqual({
      trade_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      price: 10205.75,
      amount: 0.004,
      makerFee: 0.5,
      takerFee: 0.3,
      buy_order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      sell_order_id: '503f70eb-57a6-41a6-8ef6-b50dd4452942',
      executed_at: date,
    });
  });
});
