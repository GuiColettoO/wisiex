import { Sequelize } from 'sequelize-typescript';
import { OrderModel } from '../../../infra/order.model';
import { OrderSequelizeRepository } from '../../../infra/order-sequelize.repository';
import { GetOrderBookUseCase } from '../get-order-book.use-case';
import { Order } from '../../../domain/order.entity';
import { TypeOrder } from '../../../../@shared/domain/enums/type-order.enum';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { UserModel } from '../../../../user/infra/user.model';
import { TradeModel } from '../../../../trade/infra/trade.model';

describe('GetOrderBookUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let orderRepo: OrderSequelizeRepository;
  let useCase: GetOrderBookUseCase;

  const userId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [OrderModel, UserModel, TradeModel],
      logging: false,
    });
});

beforeEach(async () => {
      await sequelize.sync({ force: true });

          await UserModel.create({
      user_id: userId,
      username: 'U',
      btc_balance: 10,
      usd_balance: 1000,
      created_at: new Date(),
    });

    orderRepo = new OrderSequelizeRepository(OrderModel);
    useCase = new GetOrderBookUseCase(orderRepo);
  });

  afterAll(async () => await sequelize.close());

  test('should aggregate bids and asks by price', async () => {
    const uuid = new Uuid(userId);
    const b1 = Order.create({
      user_id: uuid,
      type: TypeOrder.BUY,
      price: 100,
      amount: 1,
    });
    const b2 = Order.create({
      user_id: uuid,
      type: TypeOrder.BUY,
      price: 100,
      amount: 2,
    });
    const b3 = Order.create({
      user_id: uuid,
      type: TypeOrder.BUY,
      price: 90,
      amount: 3,
    });
    await orderRepo.save(b1);
    await orderRepo.save(b2);
    await orderRepo.save(b3);
    const a1 = Order.create({
      user_id: uuid,
      type: TypeOrder.SELL,
      price: 110,
      amount: 1.5,
    });
    const a2 = Order.create({
      user_id: uuid,
      type: TypeOrder.SELL,
      price: 110,
      amount: 0.5,
    });
    await orderRepo.save(a1);
    await orderRepo.save(a2);

    const { bids, asks } = await useCase.execute();
    expect(bids).toEqual([
      { price: 100, volume: 3 },
      { price: 90, volume: 3 },
    ]);
    expect(asks).toEqual([{ price: 110, volume: 2 }]);
  });
});
