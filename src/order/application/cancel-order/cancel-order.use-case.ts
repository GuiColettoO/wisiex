import { DomainError } from "../../../@shared/domain/validators/domain.error";
import { Uuid } from "../../../@shared/domain/value-objects/uuid/uuid.vo";
import { IOrderRepository } from "../../domain/order.interface.repository";

export class CancelOrderUseCase {
    constructor(private readonly orderRepo: IOrderRepository) {}
  
    async execute(userId: Uuid, orderId: Uuid): Promise<void> {
      const order = await this.orderRepo.findById(orderId);
      if (!order) throw new DomainError('Order not found');
      if (order.user_id.id !== userId.id) throw new DomainError('Unauthorized');
      order.cancel();
      await this.orderRepo.save(order);
    }
  }