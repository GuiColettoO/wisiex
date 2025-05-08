import { Trade } from "../../domain/trade.entity";
import { ITradeRepository } from "../../domain/trade.interface.repository";

export class GetGlobalMatchesUseCase {
  constructor(private tradeRepo: ITradeRepository) {}

  async execute(limit = 20): Promise<GetGlobalMatchesOutput> {
    const trades = await this.tradeRepo.findRecent(limit);
    return {
      trades: trades.map((t: Trade) => ({
        trade_id: t.trade_id.id,
        price: t.price.value,
        amount: t.amount.value,
        makerFee: t.makerFee.value,
        takerFee: t.takerFee.value,
        executed_at: t.executed_at,
      })),
    };
  }
}

export type GetGlobalMatchesOutput = {
  trades: {
    trade_id: string;
    price: number;
    amount: number;
    makerFee: number;
    takerFee: number;
    executed_at: Date;
  }[];
};
