import { Sequelize } from 'sequelize-typescript';
import { TradeModel } from '../../../trade/infra/trade.model';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { OrderModel } from '../../../order/infra/order.model';
import { UserModel } from '../../../user/infra/user.model';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../../domain/enum/status-order.enum';
import { OrderModelMapper } from '../order-model.mapper';
import { Order } from '../../domain/order.entity';

describe('OrderModelMapper Integration Tests', () => {
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

  test('should convert a order model to a order aggregate', () => {
    const date = new Date();

    const model = OrderModel.build({
      order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c7',
      type: TypeOrder.BUY,
      price: 10205.75,
      amount: 0.004,
      filledAmount: 0,
      status: StatusOrder.OPEN,
      created_at: date,
    });

    const aggregate = OrderModelMapper.toEntity(model);

    expect(aggregate.toJSON()).toStrictEqual(
      new Order({
        order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
        user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
        type: TypeOrder.BUY,
        price: 10205.75,
        amount: 0.004,
        filledAmount: 0,
        status: StatusOrder.OPEN,
        created_at: date,
      }).toJSON()
    );
  });

  test('should convert a order aggregate to a order model', () => {
    const date = new Date();
    const aggregate = new Order({
      order_id: new Uuid('e933196c-2977-4f78-8d10-ca4a3ec3e138'),
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 10205.75,
      amount: 0.004,
      filledAmount: 0,
      status: StatusOrder.OPEN,
      created_at: date,
    });

    const model = OrderModelMapper.toModel(aggregate);

    expect(model.toJSON()).toStrictEqual({
      order_id: 'e933196c-2977-4f78-8d10-ca4a3ec3e138',
      user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c7',
      type: TypeOrder.BUY,
      price: 10205.75,
      amount: 0.004,
      filledAmount: 0,
      status: StatusOrder.OPEN,
      created_at: date,
      updated_at: null,
    });
  });
});
