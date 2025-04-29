import { Sequelize } from 'sequelize-typescript';
import { UserSequelizeRepository } from '../user-sequelize.repository';
import { UserModel } from '../user.model';
import { TradeModel } from '../../../trade/infra/trade.model';
import { OrderModel } from '../../../order/infra/order.model';
import { User } from '../../domain/user.entity';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';

describe('UserSequelizeRepository Integration Tests', () => {
  let repository: UserSequelizeRepository;
  let sequelize: Sequelize;

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
    repository = new UserSequelizeRepository(UserModel);
  });

  test('should inserts a new entity', async () => {
    let user = User.create({
      username: 'Guilherme',
      btc_balance: 50000,
      usd_balance: 50000,
    });

    await repository.save(user);
    let entity = await repository.findById(user.user_id);
    expect(entity.toJSON()).toStrictEqual(user.toJSON());
  });

  test('should finds a entity by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();

    let user = User.create({
      username: 'Guilherme',
      btc_balance: 50000,
      usd_balance: 50000,
    });

    await repository.save(user);
    entityFound = await repository.findById(user.user_id);
    expect(user.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  test('should finds a entity by username', async () => {
    let user = User.create({
      username: 'Guilherme',
      btc_balance: 50000,
      usd_balance: 50000,
    });

    await repository.save(user);
    const entityFound = await repository.findByUsername(user.username);
    expect(user.toJSON()).toStrictEqual(entityFound.toJSON());
  });
});
