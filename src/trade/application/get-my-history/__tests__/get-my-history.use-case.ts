// src/trade/application/__tests__/get-my-history.use-case.spec.ts
import { Sequelize } from 'sequelize-typescript';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../../order/infra/order.model';
import { UserSequelizeRepository } from '../../../../user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from '../../../../order/infra/order-sequelize.repository';
import { GetMyHistoryUseCase } from '../get-my-history.use-case';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { TradeSequelizeRepository } from '../../../infra/trade-sequelize.repository';
import { TradeModel } from '../../../infra/trade.model';
import { Trade } from '../../../domain/trade.entity';

describe('GetMyHistoryUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let orderRepo: OrderSequelizeRepository;
  let tradeRepo: TradeSequelizeRepository;
  let useCase: GetMyHistoryUseCase;
  const userId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';
  const buyId = new Uuid();
  const sellId = new Uuid();

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

    userRepo = new UserSequelizeRepository(UserModel);
    orderRepo = new OrderSequelizeRepository(OrderModel);
    tradeRepo = new TradeSequelizeRepository(TradeModel);
    useCase = new GetMyHistoryUseCase(userRepo, orderRepo, tradeRepo);
  });

  test('returns user history sorted descending with correct types', async () => {
    const t1 = Trade.create({
      buy_order_id: buyId,
      sell_order_id: sellId,
      price: 100,
      amount: 1,
    });
    await tradeRepo.save(t1);

    const t2 = Trade.create({
      buy_order_id: buyId,
      sell_order_id: sellId,
      price: 110,
      amount: 2,
    });
    await tradeRepo.save(t2);

    const t3 = Trade.create({
      buy_order_id: buyId,
      sell_order_id: sellId,
      price: 120,
      amount: 3,
    });
    await tradeRepo.save(t3);

    const { trades } = await useCase.execute({user_id: userId});
    console.log(trades);

    expect(trades).toHaveLength(3);
    expect(trades[0].trade_id).toBe(t3.trade_id.id);
    expect(trades[1].trade_id).toBe(t2.trade_id.id);
    expect(trades[0].price).toBe(120);
    expect(trades[1].price).toBe(110);
  });
});
