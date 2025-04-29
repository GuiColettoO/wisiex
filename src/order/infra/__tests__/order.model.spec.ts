import { DataType, Sequelize } from 'sequelize-typescript';
import { OrderModel } from '../../../order/infra/order.model';
import { UserModel } from '../../../user/infra/user.model';
import { TradeModel } from '../../../trade/infra/trade.model';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../../domain/enum/status-order.enum';

describe('OrderModel Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel, OrderModel, TradeModel],
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
  });

  test('mapping props', () => {
    const attributesMap = OrderModel.getAttributes();
    const attributes = Object.keys(OrderModel.getAttributes());

    expect(attributes).toStrictEqual([
      'order_id',
      'type',
      'price',
      'amount',
      'filledAmount',
      'status',
      'created_at',
      'updated_at',
      'user_id',
    ]);

    const orderIdAttr = attributesMap.order_id;
    expect(orderIdAttr).toMatchObject({
      field: 'order_id',
      fieldName: 'order_id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const typeAttr = attributesMap.type;
    expect(typeAttr).toMatchObject({
      field: 'type',
      fieldName: 'type',
      allowNull: false,
      type: DataType.ENUM(...Object.values(TypeOrder)),
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

    const filledAmountAttr = attributesMap.filledAmount;
    expect(filledAmountAttr).toMatchObject({
      field: 'filledAmount',
      fieldName: 'filledAmount',
      allowNull: false,
      type: DataType.DECIMAL(30, 8),
    });

    const statusAttr = attributesMap.status;
    expect(statusAttr).toMatchObject({
      field: 'status',
      fieldName: 'status',
      allowNull: false,
      type: DataType.ENUM(...Object.values(StatusOrder)),
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(3),
    });

    const updatedAtAttr = attributesMap.updated_at;
    expect(updatedAtAttr).toMatchObject({
      field: 'updated_at',
      fieldName: 'updated_at',
      allowNull: true,
      type: DataType.DATE(3),
    });

    const userAttr = attributesMap.user_id;
    expect(userAttr).toMatchObject({
      field: 'user_id',
      fieldName: 'user_id',
      type: DataType.UUID(),
    });
  });

  test('create', async () => {
    const arrange = {
      order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c7',
      type: TypeOrder.BUY,
      price: 10205.75,
      amount: 0.004,
      filledAmount: 0,
      status: StatusOrder.OPEN,
      created_at: new Date(),
    };

    const trade = await OrderModel.create(arrange);

    expect(trade.toJSON()).toStrictEqual(arrange);
  });
});
