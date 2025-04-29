import { DataType, Sequelize } from 'sequelize-typescript';
import { OrderModel } from '../../../order/infra/order.model';
import { UserModel } from '../../../user/infra/user.model';
import { TradeModel } from '../trade.model';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../../../order/domain/enum/status-order.enum';

describe('TradeModel Integration Tests', () => {
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

  test('mapping props', () => {
    const attributesMap = TradeModel.getAttributes();
    const attributes = Object.keys(TradeModel.getAttributes());

    expect(attributes).toStrictEqual([
      'trade_id',
      'price',
      'amount',
      'makerFee',
      'takerFee',
      'executed_at',
      'buy_order_id',
      'sell_order_id',
    ]);

    const tradeIdAttr = attributesMap.trade_id;
    expect(tradeIdAttr).toMatchObject({
      field: 'trade_id',
      fieldName: 'trade_id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const priceAttr = attributesMap.price;
    expect(priceAttr).toMatchObject({
      field: 'price',
      fieldName: 'price',
      allowNull: false,
      type: DataType.DECIMAL(30, 8),
    });

    const amountAttr = attributesMap.amount;
    expect(amountAttr).toMatchObject({
      field: 'amount',
      fieldName: 'amount',
      allowNull: false,
      type: DataType.DECIMAL(30, 8),
    });

    const makerFeeAttr = attributesMap.makerFee;
    expect(makerFeeAttr).toMatchObject({
      field: 'makerFee',
      fieldName: 'makerFee',
      allowNull: false,
      type: DataType.DECIMAL(10, 4),
    });

    const takerFeeAttr = attributesMap.takerFee;
    expect(takerFeeAttr).toMatchObject({
      field: 'takerFee',
      fieldName: 'takerFee',
      allowNull: false,
      type: DataType.DECIMAL(10, 4),
    });

    const executedAtAttr = attributesMap.executed_at;
    expect(executedAtAttr).toMatchObject({
      field: 'executed_at',
      fieldName: 'executed_at',
      allowNull: false,
      type: DataType.DATE(3),
    });

    const buyOrderIdAttr = attributesMap.buy_order_id;
    expect(buyOrderIdAttr).toMatchObject({
      field: 'buy_order_id',
      fieldName: 'buy_order_id',
      type: DataType.UUID(),
    });

    const sellOrderIdAttr = attributesMap.sell_order_id;
    expect(sellOrderIdAttr).toMatchObject({
      field: 'sell_order_id',
      fieldName: 'sell_order_id',
      type: DataType.UUID(),
    });
  });

  test('create', async () => {
    const arrange = {
      trade_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      price: 10205.75,
      amount: 0.004,
      makerFee: 0.5,
      takerFee: 0.3,
      executed_at: new Date(),
      buy_order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      sell_order_id: '503f70eb-57a6-41a6-8ef6-b50dd4452942',
    };

    const trade = await TradeModel.create(arrange);

    expect(trade.toJSON()).toStrictEqual(arrange);
  });
});
