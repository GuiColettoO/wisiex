import { Sequelize } from 'sequelize-typescript';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../infra/order.model';
import { UserSequelizeRepository } from '../../../../user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from '../../../infra/order-sequelize.repository';
import { GetMyActiveOrdersUseCase } from '../get-my-active-orders.use-case';
import { Order } from '../../../domain/order.entity';
import { TypeOrder } from '../../../../@shared/domain/enums/type-order.enum';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { TradeModel } from '../../../../trade/infra/trade.model';

describe('GetMyActiveOrdersUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let orderRepo: OrderSequelizeRepository;
  let useCase: GetMyActiveOrdersUseCase;
  
  const userId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';

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
      user_id: userId,
      username: 'U',
      btc_balance: 10,
      usd_balance: 1000,
      created_at: new Date(),
    });
    userRepo = new UserSequelizeRepository(UserModel);
    orderRepo = new OrderSequelizeRepository(OrderModel);
    useCase = new GetMyActiveOrdersUseCase(orderRepo);
  });

  afterAll(async () => await sequelize.close());

  test('should return only OPEN and PARTIAL orders', async () => {
    const userUuid = new Uuid(userId);
    const o1 = Order.create({
      user_id: userUuid,
      type: TypeOrder.BUY,
      price: 50,
      amount: 1,
    });
    await orderRepo.save(o1);
    const o2 = Order.create({
      user_id: userUuid,
      type: TypeOrder.SELL,
      price: 60,
      amount: 2,
    });
    o2.fill(1);
    await orderRepo.save(o2);
    const o3 = Order.create({
      user_id: userUuid,
      type: TypeOrder.BUY,
      price: 70,
      amount: 3,
    });
    o3.fill(3);
    await orderRepo.save(o3);

    const res = await useCase.execute({ user_id: userId });
    expect(res.orders).toHaveLength(2);
    const ids = res.orders.map((o) => o.order_id);
    expect(ids).toContain(o1.order_id.id);
    expect(ids).toContain(o2.order_id.id);
  });
});
