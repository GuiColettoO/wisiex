import { DataType, Sequelize } from 'sequelize-typescript';
import { UserModel } from '../user.model';
import { TradeModel } from '../../../trade/infra/trade.model';
import { OrderModel } from '../../../order/infra/order.model';

describe('UserModel Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [UserModel, TradeModel, OrderModel],
      logging: false,
    });

    await sequelize.sync({ force: true });
  });

  test('mapping props', () => {
    const attributesMap = UserModel.getAttributes();
    const attributes = Object.keys(UserModel.getAttributes());

    expect(attributes).toStrictEqual([
      'user_id',
      'username',
      'btc_balance',
      'usd_balance',
      'created_at',
      'updated_at',
    ]);

    const userIdAttr = attributesMap.user_id;
    expect(userIdAttr).toMatchObject({
      field: 'user_id',
      fieldName: 'user_id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const usernameAttr = attributesMap.username;
    expect(usernameAttr).toMatchObject({
      field: 'username',
      fieldName: 'username',
      allowNull: false,
      type: DataType.STRING(),
    });

    const btcBalanceAttr = attributesMap.btc_balance;
    expect(btcBalanceAttr).toMatchObject({
      field: 'btc_balance',
      fieldName: 'btc_balance',
      allowNull: false,
      type: DataType.DECIMAL(30, 8),
    });

    const usdBalanceAttr = attributesMap.usd_balance;
    expect(usdBalanceAttr).toMatchObject({
      field: 'usd_balance',
      fieldName: 'usd_balance',
      allowNull: false,
      type: DataType.DECIMAL(30, 8),
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(3),
    });

    const updatedAtAttr = attributesMap.updated_at;
    expect(updatedAtAttr).toMatchObject({
      field: 'updated_at',
      fieldName: 'updated_at',
      allowNull: true,
      type: DataType.DATE(3),
    });
  });

  test('create', async () => {
    const arrange = {
      user_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      username: 'user',
      btc_balance: 1000,
      usd_balance: 5000,
      created_at: new Date(),
    };

    const user = await UserModel.create(arrange);

    expect(user.toJSON()).toStrictEqual(arrange);
  });
});
