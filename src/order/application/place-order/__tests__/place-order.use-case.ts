import { Sequelize } from "sequelize-typescript";
import { UserSequelizeRepository } from "../../../../user/infra/user-sequelize.repository";
import { OrderSequelizeRepository } from "../../../infra/order-sequelize.repository";
import { TradeSequelizeRepository } from "../../../../trade/infra/trade-sequelize.repository";
import { PlaceOrderUseCase } from "../place-order.use-case";
import { UserModel } from "../../../../user/infra/user.model";
import { OrderModel } from "../../../infra/order.model";
import { TradeModel } from "../../../../trade/infra/trade.model";
import { TypeOrder } from "../../../../@shared/domain/enums/type-order.enum";
import { Order } from "../../../domain/order.entity";
import { Uuid } from "../../../../@shared/domain/value-objects/uuid/uuid.vo";

describe('PlaceOrderUseCase Integration Tests', () => {
  let sequelize: Sequelize;
  let userRepo: UserSequelizeRepository;
  let orderRepo: OrderSequelizeRepository;
  let tradeRepo: TradeSequelizeRepository;
  let useCase: PlaceOrderUseCase;

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
      username: 'Maker',
      btc_balance: 1000,
      usd_balance: 5000,
      created_at: new Date(),
    });

    await UserModel.create({
        user_id: '40dbc96d-e157-4432-af45-0b2a2d4b15c6',
        username: 'Taker',
        btc_balance: 1000,
        usd_balance: 5000,
        created_at: new Date(),
    });



    userRepo = new UserSequelizeRepository(UserModel);
    orderRepo = new OrderSequelizeRepository(OrderModel);
    tradeRepo = new TradeSequelizeRepository(TradeModel);
    useCase = new PlaceOrderUseCase(orderRepo, tradeRepo, userRepo);
  });

test('matches a buy order fully and updates balances', async () => {

    const makerOrder = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type:    TypeOrder.SELL,
      price:   10000,
      amount:  0.5,
    });
    await orderRepo.save(makerOrder);


    const { order: takerOrder, trades } = await useCase.execute({
      userId: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c6'),
      type:   TypeOrder.BUY,
      price:  10000,
      amount: 0.3,
    });

    // 3) asserts...
    expect(trades).toHaveLength(1);
    expect((takerOrder as any).status).toBe('FILLED');
    // e assim por diante
  });

  test('leaves a partial order open if amount > book', async () => {
    // 1) crie a ordem maker aqui também
    const makerOrder = Order.create({
      user_id: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c7'),
      type:    TypeOrder.SELL,
      price:   10000,
      amount:  0.5,
    });
    await orderRepo.save(makerOrder);

    // 2) execute e faça seus asserts de partial
    const { order: takerOrder, trades } = await useCase.execute({
      userId: new Uuid('40dbc96d-e157-4432-af45-0b2a2d4b15c6'),
      type:   TypeOrder.BUY,
      price:  10000,
      amount: 0.8,
    });

    expect(trades).toHaveLength(1);
    expect((takerOrder as any).status).toBe('PARTIAL');
  });
});
