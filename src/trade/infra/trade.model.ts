// src/infrastructure/database/models/trade.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { OrderModel } from '../../order/infra/order.model';

@Table({
  tableName: 'trades',
  timestamps: false,
})
export class TradeModel extends Model<TradeModel> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare trade_id: string;

  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare price: number;

  @Column({ type: DataType.DECIMAL(30, 8), allowNull: false })
  declare amount: number;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: false })
  declare makerFee: number;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: false })
  declare takerFee: number;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE(3), allowNull: false })
  declare executed_at: Date;

  @ForeignKey(() => OrderModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare buy_order_id: string;

  @BelongsTo(() => OrderModel, 'buy_order_id')
  declare buyOrder: OrderModel;

  @ForeignKey(() => OrderModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sell_order_id: string;

  @BelongsTo(() => OrderModel, 'sell_order_id')
  declare sellOrder: OrderModel;
}
