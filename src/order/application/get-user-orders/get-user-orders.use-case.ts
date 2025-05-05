import { Uuid } from "../../../@shared/domain/value-objects/uuid/uuid.vo";
import { Order } from "../../domain/order.entity";
import { IOrderRepository } from "../../domain/order.interface.repository";


export class GetUserOrdersUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(userId: Uuid): Promise<Order[]> {
    const orders = await this.orderRepo.findByUser(userId);
    return orders.filter(o => {
      const status = (o as any).status;
      return status === 'OPEN' || status === 'PARTIAL';
    });
  }
}