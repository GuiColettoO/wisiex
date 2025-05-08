import { Sequelize } from 'sequelize-typescript';
import { UserSequelizeRepository } from '../../../../user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from '../../../infra/order-sequelize.repository';
import { PlaceOrderUseCase } from '../place-order.use-case';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../infra/order.model';
import { TradeModel } from '../../../../trade/infra/trade.model';
import { TypeOrder } from '../../../../@shared/domain/enums/type-order.enum';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { FakeOrderQueue } from '../../../infra/in-memory/fake-order-queue';

describe('PlaceOrderUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let orderRepo: OrderSequelizeRepository;
  let orderQueue: FakeOrderQueue;
  let useCase: PlaceOrderUseCase;

  const makerId = '40dbc96d-e157-4432-af45-0b2a2d4b15c7';
  const takerId = '40dbc96d-e157-4432-af45-0b2a2d4b15c6';

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
      user_id: makerId,
      username: 'Maker',
      btc_balance: 1000,
      usd_balance: 5000,
      created_at: new Date(),
    });

    await UserModel.create({
      user_id: takerId,
      username: 'Taker',
      btc_balance: 1000,
      usd_balance: 5000,
      created_at: new Date(),
    });

    userRepo   = new UserSequelizeRepository(UserModel);
    orderRepo  = new OrderSequelizeRepository(OrderModel);
    orderQueue = new FakeOrderQueue();
    useCase    = new PlaceOrderUseCase(userRepo, orderRepo, orderQueue);
  });

  test('enqueues a BUY order, persistes OPEN and reserva USD', async () => {
    const result = await useCase.execute({
      user_id: takerId,
      type:    TypeOrder.BUY,
      price:   10000,
      amount:  0.3,
    });

    expect(result.status).toBe('OPEN');
    expect(result.price).toBe(10000);
    expect(result.amount).toBe(0.3);

    const saved = await orderRepo.findById(new Uuid(result.order_id));
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe('OPEN');


    const takerUser = await userRepo.findById(new Uuid(takerId));
    expect(takerUser!.usd_balance).toBeCloseTo(2000);
    expect(takerUser!.btc_balance).toBe(1000); 

    const buffer = orderQueue.getBuffer();
    expect(buffer).toHaveLength(1);
    expect(buffer[0].order_id.id).toBe(result.order_id);
    expect(buffer[0].status).toBe('OPEN');
  });

  test('enqueues a SELL order, persistes OPEN e reserva BTC', async () => {
    const result = await useCase.execute({
      user_id: makerId,
      type:    TypeOrder.SELL,
      price:   12000,
      amount:  0.5,
    });

    expect(result.status).toBe('OPEN');
    expect(result.price).toBe(12000);
    expect(result.amount).toBe(0.5);

    const saved = await orderRepo.findById(new Uuid(result.order_id));
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe('OPEN');

    const makerUser = await userRepo.findById(new Uuid(makerId));
    expect(makerUser!.btc_balance).toBeCloseTo(999.5);
    expect(makerUser!.usd_balance).toBe(5000);
    const buffer = orderQueue.getBuffer();
    expect(buffer).toHaveLength(1);
    expect(buffer[0].order_id.id).toBe(result.order_id);
  });
});
