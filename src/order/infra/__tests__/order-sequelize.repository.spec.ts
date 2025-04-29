import { Sequelize } from 'sequelize-typescript';
import { OrderModel } from '../../../order/infra/order.model';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { UserModel } from '../../../user/infra/user.model';
import { OrderSequelizeRepository } from '../order-sequelize.repository';
import { TradeModel } from '../../../trade/infra/trade.model';
import { Order } from '../../domain/order.entity';
import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../../domain/enum/status-order.enum';

describe('TradeSequelizeRepository Integration Tests', () => {
  let repository: OrderSequelizeRepository;
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

    repository = new OrderSequelizeRepository(OrderModel);
  });

  test('should inserts a new entity', async () => {
    const order = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 5000,
      amount: 0.25,
    });

    await repository.save(order);
    let entity = await repository.findById(order.order_id);
    expect(entity.toJSON()).toStrictEqual(order.toJSON());
  });

  test('should update an existing Order', async () => {
    const order = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.SELL,
      price: 6000,
      amount: 0.5,
    });
    await repository.save(order);

    order.fill(0.2);
    await repository.save(order);

    const updated = await repository.findById(order.order_id);
    expect(updated).not.toBeNull();
    expect(updated.filledAmount.value).toBeCloseTo(0.2);
    expect(updated.status).toBe(StatusOrder.PARTIAL);
  });

  test('should find orders by user', async () => {
    const order1 = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 1000,
      amount: 0.1,
    });
    const order2 = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.SELL,
      price: 2000,
      amount: 0.2,
    });

    await repository.save(order1);
    await repository.save(order2);

    const list = await repository.findByUser(
      new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7')
    );
    const ids = list.map((o) => o.order_id.id).sort();
    expect(ids).toEqual([order1.order_id.id, order2.order_id.id].sort());
  });

  test('should find open buys sorted by price desc', async () => {
    const buy1 = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 3000,
      amount: 0.1,
    });
    const buy2 = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 4000,
      amount: 0.1,
    });
    const sell = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.SELL,
      price: 2500,
      amount: 0.1,
    });
    await repository.save(buy1);
    await repository.save(buy2);
    await repository.save(sell);

    const bids = await repository.findOpenBuys();
    expect(bids.map((b) => b.price.value)).toEqual([4000, 3000]);
  });

  test('should find open sells sorted by price asc', async () => {
    const sell1 = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.SELL,
      price: 5000,
      amount: 0.1,
    });
    const sell2 = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.SELL,
      price: 4500,
      amount: 0.1,
    });
    const buy = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 6000,
      amount: 0.1,
    });

    await repository.save(sell1);
    await repository.save(sell2);
    await repository.save(buy);

    const asks = await repository.findOpenSells();
    expect(asks.map((a) => a.price.value)).toEqual([4500, 5000]);
  });

  test('should delete an Order', async () => {
    const order = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type: TypeOrder.BUY,
      price: 7000,
      amount: 0.1,
    });
    await repository.save(order);

    await repository.delete(order);
    const found = await repository.findById(order.order_id);
    expect(found).toBeNull();
  });
});
