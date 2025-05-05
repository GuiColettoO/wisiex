import { Sequelize } from 'sequelize-typescript';
import { TradeModel } from '../../../trade/infra/trade.model';
import { OrderModel } from '../../../order/infra/order.model';
import { UserSequelizeRepository } from '../../infra/user-sequelize.repository';
import { SignInUseCase } from '../authentication.use-case';
import { UserModel } from '../../infra/user.model';
import jwt from 'jsonwebtoken';

describe('UserSequelizeRepository Integration Tests', () => {
  let repository: UserSequelizeRepository;
  let useCase: SignInUseCase;
  let sequelize: Sequelize;

  beforeAll(async () => {
    process.env.JSON_WEB_TOKEN_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '1h';

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel, TradeModel, OrderModel],
      logging: false,
    });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    repository = new UserSequelizeRepository(UserModel);
    useCase = new SignInUseCase(repository);
  });

  test('should create a new user and return a valid JWT', async () => {
    const result = await useCase.execute({ username: 'Guilherme' });
    expect(result).toHaveProperty('access_token');

    const token = result.access_token;
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const payload: any = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET!);
    expect(payload).toHaveProperty('user_id');

    const user = await repository.findByUsername('Guilherme');
    expect(user).not.toBeNull();
    expect(payload.user_id.id).toBe(user!.user_id.id);
  });

  test('should not create duplicate user on subsequent logins', async () => {
    const first = await useCase.execute({ username: 'Guilherme' });
    const count1 = await UserModel.count();

    const second = await useCase.execute({ username: 'Guilherme' });
    const count2 = await UserModel.count();
    expect(count2).toBe(count1);

    const p1: any = jwt.decode(first.access_token)!;
    const p2: any = jwt.decode(second.access_token)!;
    expect(p1.user_id.id).toBe(p2.user_id.id);
  });

});
