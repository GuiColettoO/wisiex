import { DomainError } from '../../../@shared/domain/validators/domain.error';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { IOrderRepository } from '../../../order/domain/order.interface.repository';
import { IUserRepository } from '../../../user/domain/user.interface.repository';
import { Trade } from '../../domain/trade.entity';
import { ITradeRepository } from '../../domain/trade.interface.repository';

export class GetMyHistoryUseCase {
  constructor(
    private userRepo: IUserRepository,
    private orderRepo: IOrderRepository,
    private tradeRepo: ITradeRepository
  ) {}

  async execute(input: GetMyHistoryInput): Promise<GetMyHistoryOutput> {
    const user = await this.userRepo.findById(new Uuid(input.user_id));
    if (!user) {
      throw new DomainError('Usuário não encontrado');
    }

    const orders = await this.orderRepo.findByUser(new Uuid(input.user_id));
    const allTrades: Trade[] = [];

    for (const order of orders) {
      const trades = await this.tradeRepo.findByOrderId(order.order_id);
      allTrades.push(...trades);
    }

    const uniqueMap = new Map<string, Trade>();
    for (const t of allTrades) {
      if (!uniqueMap.has(t.trade_id.id)) {
        uniqueMap.set(t.trade_id.id, t);
      }
    }
    const uniqueTrades = Array.from(uniqueMap.values());

    uniqueTrades.sort(
      (a, b) => b.executed_at.getTime() - a.executed_at.getTime()
    );

    const tradesDTO: TradeDTO[] = uniqueTrades.map((t) => {
      const type = t.buy_order_id.id === input.user_id ? 'BUY' : 'SELL';
      return {
        trade_id: t.trade_id.id,
        price: t.price.value,
        amount: t.amount.value,
        type,
        executed_at: t.executed_at,
      };
    });

    return { trades: tradesDTO };
  }
}

export type GetMyHistoryInput = { user_id: string };

export type TradeDTO = {
  trade_id: string;
  price: number;
  amount: number;
  type: 'BUY' | 'SELL';
  executed_at: Date;
};

export type GetMyHistoryOutput = { trades: TradeDTO[] };
