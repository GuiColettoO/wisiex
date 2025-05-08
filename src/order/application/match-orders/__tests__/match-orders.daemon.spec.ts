import { Sequelize } from 'sequelize-typescript';
import { UserSequelizeRepository } from '../../../../user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from '../../../infra/order-sequelize.repository';
import { TradeSequelizeRepository } from '../../../../trade/infra/trade-sequelize.repository';
import { MatchOrdersDaemon } from '../match-orders.daemon';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../infra/order.model';
import { TradeModel } from '../../../../trade/infra/trade.model';
import { TypeOrder } from '../../../../@shared/domain/enums/type-order.enum';
import { Order } from '../../../domain/order.entity';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { FakeOrderQueue } from '../../../infra/in-memory/fake-order-queue';

describe('MatchOrdersDaemon Integration Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let orderRepo: OrderSequelizeRepository;
  let tradeRepo: TradeSequelizeRepository;
  let queue: FakeOrderQueue;
  let daemon: MatchOrdersDaemon;

  const makerId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';
  const takerId = '5afcc542-ff23-4111-ab2f-940bc28b4994';

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

    await UserModel.bulkCreate([
      {
        user_id: makerId,
        username: 'Maker',
        btc_balance: 100000,
        usd_balance: 50000,
        created_at: new Date(),
      },
      {
        user_id: takerId,
        username: 'Taker',
        btc_balance: 100000,
        usd_balance: 50000,
        created_at: new Date(),
      },
    ]);

    userRepo = new UserSequelizeRepository(UserModel);
    orderRepo = new OrderSequelizeRepository(OrderModel);
    tradeRepo = new TradeSequelizeRepository(TradeModel);
    queue = new FakeOrderQueue();
    daemon = new MatchOrdersDaemon(queue, orderRepo, tradeRepo, userRepo);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('full match: BUY 0.3 matches SELL 0.5 @10000', async () => {
    const makerOrder = Order.create({
      user_id: new Uuid(makerId),
      type: TypeOrder.SELL,
      price: 10000,
      amount: 0.5,
    });
    await orderRepo.save(makerOrder);

    const takerOrder = Order.create({
      user_id: new Uuid(takerId),
      type: TypeOrder.BUY,
      price: 10000,
      amount: 0.3,
    });
    await orderRepo.save(takerOrder);
    await queue.enqueue(takerOrder);

    await daemon.processNext();

    const takerTrades = await tradeRepo.findByOrderId(
      new Uuid(takerOrder.order_id.id)
    );
    expect(takerTrades).toHaveLength(1);
    expect(takerTrades[0].price.value).toBe(10000);
    expect(takerTrades[0].amount.value).toBe(0.3);

    const updatedMaker = await orderRepo.findById(makerOrder.order_id);
    expect(updatedMaker!.status).toBe('PARTIAL');
    expect((updatedMaker as any).filledAmount.value).toBe(0.3);

    const updatedTaker = await orderRepo.findById(takerOrder.order_id);
    expect(updatedTaker!.status).toBe('FILLED');
    expect((updatedTaker as any).filledAmount.value).toBe(0.3);

    const makerUser = await userRepo.findById(new Uuid(makerId))!;
    console.log(makerUser);
    const takerUser = await userRepo.findById(new Uuid(takerId))!;
    expect(makerUser!.usd_balance).toBeCloseTo(50000 + 10000 * 0.3 * 0.995);
    expect(makerUser!.btc_balance).toBe(99999.7);
    expect(takerUser!.usd_balance).toBeCloseTo(50000 - 10000 * 0.3 * 1.003);
    expect(takerUser!.btc_balance).toBe(100000.3);
  });

  test('partial match: BUY 0.8 matches SELL 0.5 @10000', async () => {
    const makerOrder = Order.create({
      user_id: new Uuid(makerId),
      type: TypeOrder.SELL,
      price: 10000,
      amount: 0.5,
    });
    await orderRepo.save(makerOrder);

    const takerOrder = Order.create({
      user_id: new Uuid(takerId),
      type: TypeOrder.BUY,
      price: 10000,
      amount: 0.8,
    });
    await orderRepo.save(takerOrder);
    await queue.enqueue(takerOrder);

    await daemon.processNext();

    const trades = await tradeRepo.findByOrderId(
      new Uuid(takerOrder.order_id.id)
    );
    expect(trades).toHaveLength(1);
    expect(trades[0].amount.value).toBe(0.5);

    const updatedMaker = await orderRepo.findById(makerOrder.order_id);
    expect(updatedMaker!.status).toBe('FILLED');

    const updatedTaker = await orderRepo.findById(takerOrder.order_id);
    expect(updatedTaker!.status).toBe('PARTIAL');
    const remaining =
      updatedTaker!.amount.value - (updatedTaker as any).filledAmount.value;
    expect(remaining).toBeCloseTo(0.3);

    const openBuys = await orderRepo.findOpenBuys();
    const residual = openBuys.find(
      (o) => o.order_id.id === takerOrder.order_id.id
    )!;
    expect(residual).toBeDefined();
    expect((residual as any).filledAmount.value).toBe(0.5);
    expect(residual.status).toBe('PARTIAL');
  });
});
