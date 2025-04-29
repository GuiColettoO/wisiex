import { Sequelize } from 'sequelize-typescript';
import { UserModel } from '../user.model';
import { OrderModel } from '../../../order/infra/order.model';
import { TradeModel } from '../../../trade/infra/trade.model';
import { UserModelMapper } from '../user-model.mapper';
import { User } from '../../domain/user.entity';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';

describe('UserModelMapper Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel, OrderModel, TradeModel],
      logging: false,
    });

    await sequelize.sync({ force: true });
  });

  test('should convert a user model to a user aggregate', () => {
    const date = new Date();

    const model = UserModel.build({
      user_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      username: 'name',
      btc_balance: 10000,
      usd_balance: 10000,
      created_at: date,
    });

    const aggregate = UserModelMapper.toEntity(model);

    expect(aggregate.toJSON()).toStrictEqual(
      new User({
        user_id: new Uuid('5490020a-e866-4229-9adc-aa44b83234c4'),
        username: 'name',
        btc_balance: 10000,
        usd_balance: 10000,
        created_at: date,
      }).toJSON()
    );
  });

  test('should convert a user aggregate to a user model', () => {
    const created_at = new Date();
    const aggregate = new User({
      user_id: new Uuid('5490020a-e866-4229-9adc-aa44b83234c4'),
      username: 'name',
      btc_balance: 10000,
      usd_balance: 10000,
      created_at,
      updated_at: null,
    });

    const model = UserModelMapper.toModel(aggregate);

    expect(model.toJSON()).toStrictEqual({
      user_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      username: 'name',
      btc_balance: 10000,
      usd_balance: 10000,
      created_at,
      updated_at: null,
    });
  });
});
