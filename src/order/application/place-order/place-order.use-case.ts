import { TypeOrder } from "../../../@shared/domain/enums/type-order.enum";
import { DomainError } from "../../../@shared/domain/validators/domain.error";
import { Uuid } from "../../../@shared/domain/value-objects/uuid/uuid.vo";
import { IUserRepository } from "../../../user/domain/user.interface.repository";
import { Order } from "../../domain/order.entity";
import { IOrderQueue, IOrderRepository } from "../../domain/order.interface.repository";

export class PlaceOrderUseCase {
  constructor(
    private userRepo: IUserRepository,
    private orderRepo: IOrderRepository,
    private orderQueue: IOrderQueue
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    
    const user = await this.userRepo.findById(new Uuid(input.user_id));
    if (!user) throw new DomainError('Usuário não encontrado');

    const totalUsd = input.price * input.amount;
    if (input.type === TypeOrder.BUY) {
      if (user.usd_balance < totalUsd) {
        throw new DomainError('Saldo USD insuficiente');
      }
      user.debitUsd(totalUsd);
    } else {
      if (user.btc_balance < input.amount) {
        throw new DomainError('Saldo BTC insuficiente');
      }
      user.debitBtc(input.amount);
    }

    await this.userRepo.save(user);

    const order = Order.create({
      user_id: user.user_id,
      type: input.type,
      price: input.price,
      amount: input.amount,
    });
    await this.orderRepo.save(order);

    await this.orderQueue.enqueue(order);

    return {
      order_id: order.order_id.id,
      status: order.status,
      price: order.price.value,
      amount: order.amount.value,
    };
  }
}

export type PlaceOrderInput = {
  user_id: string;
  type: TypeOrder;
  price: number;
  amount: number;
};

export type PlaceOrderOutput = {
  order_id: string;
  status: string;
  price: number;
  amount: number;
};