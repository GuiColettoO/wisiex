import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { UserModel } from '../../../../user/infra/user.model';
import { OrderModel } from '../../../../order/infra/order.model';
import { TradeModel } from '../../../../trade/infra/trade.model';


dotenv.config();

const {
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = '5432',
  POSTGRES_DB   = 'wisiex',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASS = 'postgres',
} = process.env;

export const sequelize = new Sequelize({
  dialect:  'postgres',
  host:     POSTGRES_HOST,
  port:     parseInt(POSTGRES_PORT, 10),
  database: POSTGRES_DB,
  username: POSTGRES_USER,
  password: POSTGRES_PASS,
  models:   [UserModel, OrderModel, TradeModel],
  logging:  false,
});

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao Postgres');
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados');
  } catch (err) {
    console.error('Erro na inicialização do DB:', err);
    process.exit(1);
  }
}
