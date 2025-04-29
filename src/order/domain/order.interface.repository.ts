import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { Order } from './order.entity';

export interface IOrderRepository {
  save(order: Order): Promise<void>;

  findById(id: Uuid): Promise<Order | null>;

  findByUser(userId: Uuid): Promise<Order[]>;

  findOpenBuys(): Promise<Order[]>;

  findOpenSells(): Promise<Order[]>;

  delete(order: Order): Promise<void>;
}
