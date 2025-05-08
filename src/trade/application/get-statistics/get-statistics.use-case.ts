import { Uuid } from "../../../@shared/domain/value-objects/uuid/uuid.vo";
import { IUserRepository } from "../../../user/domain/user.interface.repository";
import { ITradeRepository } from "../../domain/trade.interface.repository";

export class GetStatisticsUseCase {
  constructor(
    private tradeRepo: ITradeRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(input: GetStatisticsInput): Promise<GetStatisticsOutput> {
    const to = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

    const trades = await this.tradeRepo.findByDateRange(from, to);

    let lastPrice: number | null = null;
    let high: number | null = null;
    let low: number | null = null;
    let btcVolume = 0;
    let usdVolume = 0;

    for (const t of trades) {
      const p = t.price.value;
      const amt = t.amount.value;
      const tradeUsd = p * amt;

      if (lastPrice === null || t.executed_at > new Date(lastPrice)) {
        lastPrice = p;
      }
      high = high === null ? p : Math.max(high, p);
      low = low === null ? p : Math.min(low, p);
      btcVolume += amt;
      usdVolume += tradeUsd;
    }

    const user = await this.userRepo.findById(new Uuid(input.user_id));
    const userUsdBalance = user ? user.usd_balance : 0;
    const userBtcBalance = user ? user.btc_balance : 0;

    return {
      lastPrice,
      btcVolume,
      usdVolume,
      high,
      low,
      userUsdBalance,
      userBtcBalance,
    };
  }
}

export type GetStatisticsInput = { user_id: string };

export type GetStatisticsOutput = {
  lastPrice: number | null;
  btcVolume: number;
  usdVolume: number;
  high: number | null;
  low: number | null;
  userUsdBalance: number;
  userBtcBalance: number;
};