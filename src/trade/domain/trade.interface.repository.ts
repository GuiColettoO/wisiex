import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { Trade } from './trade.entity';

export interface ITradeRepository {
  save(trade: Trade): Promise<void>;

  findById(trade_id: Uuid): Promise<Trade | null>;

  findByOrderId(order_id: Uuid): Promise<Trade[]>;

  findRecent(limit: number): Promise<Trade[]>;

  findByDateRange(from: Date, to: Date): Promise<Trade[]>;
}
