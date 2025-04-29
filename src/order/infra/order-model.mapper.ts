import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { Order } from '../domain/order.entity';
import { OrderModel } from './order.model';

export class OrderModelMapper {
  static toModel(entity: Order): OrderModel {
    return OrderModel.build({
      order_id: entity.order_id.id,
      type: entity.type,
      price: entity.price.value,
      amount: entity.amount.value,
      filledAmount: entity.filledAmount.value,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      user_id: entity.user_id.id,
    });
  }

  static toEntity(model: OrderModel): Order {
    const entity = Order.reconstitute({
      order_id: new Uuid(model.order_id),
      type: model.type,
      price: model.price,
      amount: model.amount,
      filledAmount: model.filledAmount,
      status: model.status,
      created_at: model.created_at,
      updated_at: model.updated_at ?? null,
      user_id: new Uuid(model.user_id),
    });

    return entity;
  }
}
