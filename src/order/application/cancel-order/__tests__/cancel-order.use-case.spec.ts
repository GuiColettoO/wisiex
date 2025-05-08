import { Sequelize } from 'sequelize-typescript';
import { UserSequelizeRepository } from '../../../../user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from '../../../infra/order-sequelize.repository';
import {
  CancelOrderInput,
  CancelOrderOutput,
  CancelOrderUseCase,
} from '../cancel-order.use-case';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../infra/order.model';
import { TradeModel } from '../../../../trade/infra/trade.model';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { User } from '../../../../user/domain/user.entity';
import { Order } from '../../../domain/order.entity';
import { TypeOrder } from '../../../../@shared/domain/enums/type-order.enum';

describe('CancelOrderUseCase Unit Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let orderRepo: OrderSequelizeRepository;
  let useCase: CancelOrderUseCase;

  const userId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';
  const orderId = '5afcc542-ff23-4111-ab2f-940bc28b4994';

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
      username: 'TestUser',
      btc_balance: 1,
      usd_balance: 100,
      created_at: new Date(),
    });
    userRepo = new UserSequelizeRepository(UserModel);
    orderRepo = new OrderSequelizeRepository(OrderModel);
    useCase = new CancelOrderUseCase(userRepo, orderRepo);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should cancel a BUY order and refund USD', async () => {
    const user = await userRepo.findById(new Uuid(userId));
    user.debitUsd(20);
    await userRepo.save(user);

    const order = Order.create({
      user_id: user.user_id,
      type: TypeOrder.BUY,
      price: 10,
      amount: 2,
    });
    (order as any).order_id = { id: orderId };
    await orderRepo.save(order);

    const input: CancelOrderInput = { user_id: userId, order_id: orderId };
    const output: CancelOrderOutput = await useCase.execute(input);

    expect(output.order_id).toBe(orderId);
    expect(output.status).toBe('CANCELLED');

    const updatedUser = (await userRepo.findById({
      id: userId,
    } as any as Uuid)) as User;
    expect(updatedUser.usd_balance).toBeCloseTo(100);
    expect(updatedUser.btc_balance).toBeCloseTo(1);

    const updatedOrder = await orderRepo.findById({
      id: orderId,
    } as any as Uuid);
    expect(updatedOrder!.status).toBe('CANCELLED');
  });

  test('should cancel a SELL order and refund BTC', async () => {
    const user = await userRepo.findById(new Uuid(userId));
    user.debitBtc(0.5);
    await userRepo.save(user);

    const order = Order.create({
      user_id: user.user_id,
      type: TypeOrder.SELL,
      price: 20,
      amount: 0.5,
    });
    (order as any).order_id = { id: orderId };
    await orderRepo.save(order);

    const out = await useCase.execute({ user_id: userId, order_id: orderId });
    expect(out.status).toBe('CANCELLED');

    const after = (await userRepo.findById({
      id: userId,
    } as any as Uuid)) as User;
    expect(after.btc_balance).toBeCloseTo(1);
    expect(after.usd_balance).toBeCloseTo(100);
  });
});
