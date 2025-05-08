import { TypeOrder } from "../../../@shared/domain/enums/type-order.enum";
import { Uuid } from "../../../@shared/domain/value-objects/uuid/uuid.vo";
import { IOrderRepository } from "../../domain/order.interface.repository";

export class GetMyActiveOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(input: GetMyActiveOrdersInput): Promise<GetMyActiveOrdersOutput> {
    const orders = await this.orderRepo.findByUser(new Uuid(input.user_id));
    const active = orders.filter(o => ['OPEN', 'PARTIAL'].includes(o.status));
    const dtos = active.map(o => ({
      order_id: o.order_id.id,
      type: o.type,
      price: o.price.value,
      amount: o.amount.value,
      filledAmount: o.filledAmount.value,
      status: o.status,
      created_at: o.created_at,
    }));
    return { orders: dtos };
  }
}

export type GetMyActiveOrdersInput = { user_id: string };

export type OrderDTO = {
  order_id: string;
  type: TypeOrder;
  price: number;
  amount: number;
  filledAmount: number;
  status: string;
  created_at: Date;
};

export type GetMyActiveOrdersOutput = { orders: OrderDTO[] };