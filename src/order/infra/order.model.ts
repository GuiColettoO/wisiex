import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { TypeOrder } from '../../@shared/domain/enums/type-order.enum';
import { StatusOrder } from '../domain/enum/status-order.enum';
import { TradeModel } from '../../trade/infra/trade.model';
import { UserModel } from '../../user/infra/user.model';

@Table({
  tableName: 'orders',
  timestamps: false,
})
export class OrderModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare order_id: string;

  @Column({
    type: DataType.ENUM(...Object.values(TypeOrder)),
    allowNull: false,
  })
  declare type: TypeOrder;

  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare price: number;

  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare amount: number;

  @Default('0')
  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare filledAmount: number;

  @Default(StatusOrder.OPEN)
  @Column({
    type: DataType.ENUM(...Object.values(StatusOrder)),
    allowNull: false,
  })
  declare status: StatusOrder;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare created_at: Date;

  @Column({ allowNull: true, type: DataType.DATE(3) })
  declare updated_at: Date;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @HasMany(() => TradeModel, 'buy_order_id')
  declare tradesAsBuyer: TradeModel[];

  @HasMany(() => TradeModel, 'sell_order_id')
  declare tradesAsSeller: TradeModel[];
}
