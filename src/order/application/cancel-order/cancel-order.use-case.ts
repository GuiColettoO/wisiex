import { DomainError } from '../../../@shared/domain/validators/domain.error';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { IUserRepository } from '../../../user/domain/user.interface.repository';
import { IOrderRepository } from '../../domain/order.interface.repository';

export class CancelOrderUseCase {
  constructor(
    private userRepo: IUserRepository,
    private orderRepo: IOrderRepository
  ) {}

  async execute(input: CancelOrderInput): Promise<CancelOrderOutput> {
    const order = await this.orderRepo.findById(new Uuid(input.order_id));
    if (!order) throw new DomainError('Ordem não encontrada');

    if (order.user_id.id !== input.user_id) {
      throw new DomainError('Ordem não pertence ao usuário');
    }

    if (order.status !== 'OPEN' && order.status !== 'PARTIAL') {
      throw new DomainError('Somente ordens abertas podem ser canceladas');
    }

    const remaining = order.amount.value - order.filledAmount.value;

    order.cancel();
    await this.orderRepo.save(order);

    const user = await this.userRepo.findById(new Uuid(input.user_id));
    if (!user) throw new DomainError('Usuário não encontrado');

    if (order.type === 'BUY') {
      user.creditUsd(order.price.value * remaining);
    } else {
      user.creditBtc(remaining);
    }
    await this.userRepo.save(user);

    return {
      order_id: order.order_id.id,
      status: order.status,
    };
  }
}

export type CancelOrderInput = {
  user_id: string;
  order_id: string;
};

export type CancelOrderOutput = {
  order_id: string;
  status: string;
};
