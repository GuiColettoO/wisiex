import {
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { OrderModel } from '../../order/infra/order.model';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class UserModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare user_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare username: string;

  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare btc_balance: number;

  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare usd_balance: number;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare created_at: Date;

  @Column({ allowNull: true, type: DataType.DATE(3) })
  declare updated_at: Date;

  @HasMany(() => OrderModel)
  declare orders: OrderModel[];
}
