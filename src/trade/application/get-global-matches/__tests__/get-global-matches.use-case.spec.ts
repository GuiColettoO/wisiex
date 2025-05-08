import { Sequelize } from 'sequelize-typescript';
import { TradeSequelizeRepository } from '../../../infra/trade-sequelize.repository';
import { GetGlobalMatchesUseCase } from '../get-global-matches.use-case';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid/uuid.vo';
import { TradeModel } from '../../../infra/trade.model';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../../order/infra/order.model';
import { Trade } from '../../../domain/trade.entity';


describe('GetGlobalMatchesUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let tradeRepo: TradeSequelizeRepository;
  let useCase: GetGlobalMatchesUseCase;

  const userId = 'e1c7dc54-81c3-4a52-a55c-dfa1270d05e1';
  const buyId = new Uuid();
  const sellId = new Uuid();

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [TradeModel, UserModel, OrderModel],
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
    tradeRepo = new TradeSequelizeRepository(TradeModel);
    useCase = new GetGlobalMatchesUseCase(tradeRepo);
  });

  test('should return the latest trades up to limit without helper', async () => {
    const t1 = Trade.create({
      buy_order_id: buyId,
      sell_order_id: sellId,
      price: 100,
      amount: 1,
      makerFee: 100 * 1 * 0.005,
      takerFee: 100 * 1 * 0.003,
    });
    await tradeRepo.save(t1);
    await new Promise(r => setTimeout(r, 5));

    const t2 = Trade.create({
      buy_order_id: buyId,
      sell_order_id: sellId,
      price: 110,
      amount: 2,
      makerFee: 110 * 2 * 0.005,
      takerFee: 110 * 2 * 0.003,
    });
    await tradeRepo.save(t2);
    await new Promise(r => setTimeout(r, 5));

    const t3 = Trade.create({
      buy_order_id: buyId,
      sell_order_id: sellId,
      price: 120,
      amount: 3,
      makerFee: 120 * 3 * 0.005,
      takerFee: 120 * 3 * 0.003,
    });
    await tradeRepo.save(t3);

    const { trades } = await useCase.execute(2);

    expect(trades).toHaveLength(2);
    expect(trades[0].trade_id).toBe(t3.trade_id.id);
    expect(trades[1].trade_id).toBe(t2.trade_id.id);
    expect(trades[0].price).toBe(120);
    expect(trades[1].price).toBe(110);
  });
});
