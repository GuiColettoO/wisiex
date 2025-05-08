import { Sequelize } from 'sequelize-typescript';
import { UserModel } from '../../../../user/infra/user.model';
import { TradeModel } from '../../../infra/trade.model';
import { UserSequelizeRepository } from '../../../../user/infra/user-sequelize.repository';
import { TradeSequelizeRepository } from '../../../infra/trade-sequelize.repository';
import { GetStatisticsUseCase } from '../get-statistics.use-case';
import { Trade } from '../../../domain/trade.entity';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { OrderModel } from '../../../../order/infra/order.model';

describe('GetStatisticsUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let tradeRepo: TradeSequelizeRepository;
  let useCase: GetStatisticsUseCase;

    const userId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';
  const buyId = new Uuid();
  const sellId = new Uuid();

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
      user_id:     userId,
      username:    'StatsUser',
      btc_balance: 3,
      usd_balance: 300,
      created_at:  new Date(),
    });
    await OrderModel.create({
      order_id: buyId.id,
      user_id: userId,
      type: 'BUY',
      price: 100,
      amount: 1,
      filled_amount: 0,
      status: 'OPEN',
      created_at: new Date(),
    });
    await OrderModel.create({
      order_id: sellId.id,
      user_id: userId,
      type: 'SELL',
      price: 120,
      amount: 1,
      filled_amount: 0,
      status: 'OPEN',
      created_at: new Date(),
    });


    userRepo  = new UserSequelizeRepository(UserModel);
    tradeRepo = new TradeSequelizeRepository(TradeModel);
    useCase   = new GetStatisticsUseCase(tradeRepo, userRepo);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('computes correct 24h statistics and returns user balances', async () => {
    const now = Date.now();

    const t1 = Trade.create({
      buy_order_id:  buyId,
      sell_order_id: sellId,
      price:         100,
      amount:        1,
    });
    (t1 as any).executed_at = new Date(now - 2 * 60 * 60 * 1000);
    await tradeRepo.save(t1);

    const t2 = Trade.create({
      buy_order_id:  buyId,
      sell_order_id: sellId,
      price:         200,
      amount:        2,
    });
    (t2 as any).executed_at = new Date(now - 1 * 60 * 60 * 1000);
    await tradeRepo.save(t2);

    const t3 = Trade.create({
      buy_order_id:  buyId,
      sell_order_id: sellId,
      price:         300,
      amount:        3,
    });
    (t3 as any).executed_at = new Date(now - 25 * 60 * 60 * 1000);
    await tradeRepo.save(t3);

    const stats = await useCase.execute({ user_id: userId });

    expect(stats.lastPrice).toBe(200);
    expect(stats.high).toBe(200);
    expect(stats.low).toBe(100);
    expect(stats.btcVolume).toBeCloseTo(3);
    expect(stats.usdVolume).toBeCloseTo(100 * 1 + 200 * 2);
    expect(stats.userUsdBalance).toBe(300);
    expect(stats.userBtcBalance).toBe(3);
  });
});
