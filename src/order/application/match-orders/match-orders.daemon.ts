import { TypeOrder } from "../../../@shared/domain/enums/type-order.enum";
import { DomainError } from "../../../@shared/domain/validators/domain.error";
import { Uuid } from "../../../@shared/domain/value-objects/uuid/uuid.vo";
import { Trade } from "../../../trade/domain/trade.entity";
import { ITradeRepository } from "../../../trade/domain/trade.interface.repository";
import { IUserRepository } from "../../../user/domain/user.interface.repository";
import { IOrderQueue, IOrderRepository } from "../../domain/order.interface.repository";

export class MatchOrdersDaemon {
  private readonly makerFeeRate = 0.005;
  private readonly takerFeeRate = 0.003;

  constructor(
    private queue: IOrderQueue,
    private orderRepo: IOrderRepository,
    private tradeRepo: ITradeRepository,
    private userRepo: IUserRepository
  ) {}

  async run(): Promise<void> {
    while (true) {
      try {
        await this.processNext();
      } catch (err) {
        console.error('Erro no matching:', err);
      }
    }
  }

  async processNext(): Promise<void> {
    const order = await this.queue.dequeue();
    if (!order) return;

    let remaining = order.amount.value;
    const opposite = order.type === TypeOrder.BUY
      ? await this.orderRepo.findOpenSells()
      : await this.orderRepo.findOpenBuys();

    for (const makerOrder of opposite) {
      if (remaining <= 0) break;

      // verifica se os preços casam
      const priceOk = order.type === TypeOrder.BUY
        ? makerOrder.price.value <= order.price.value
        : makerOrder.price.value >= order.price.value;
      if (!priceOk) continue;

      // calculando quanto casa nessa iteração
      const avail = makerOrder.amount.value - makerOrder.filledAmount.value;
      const toMatch = Math.min(remaining, avail);
      if (toMatch <= 0) continue;

      const execPrice = makerOrder.price.value;
      const usdTraded = execPrice * toMatch;
      const makerFee = usdTraded * this.makerFeeRate;
      const takerFee = usdTraded * this.takerFeeRate;

      // 1) salva trade
      const trade = Trade.create({
        buy_order_id: order.type === TypeOrder.BUY
          ? order.order_id
          : makerOrder.order_id,
        sell_order_id: order.type === TypeOrder.SELL
          ? order.order_id
          : makerOrder.order_id,
        price: execPrice,
        amount: toMatch,
        makerFee,
        takerFee,
      });
      await this.tradeRepo.save(trade);

      makerOrder.fill(toMatch);
      await this.orderRepo.save(makerOrder);

      order.fill(toMatch);

      const makerUser = await this.userRepo.findById(
        new Uuid(makerOrder.user_id.id)
      );
      if (!makerUser) throw new DomainError('Maker não encontrado');
      makerUser.debitBtc(toMatch);
      makerUser.creditUsd(usdTraded - makerFee);
      await this.userRepo.save(makerUser);

      // 4) ajusta saldo do taker
      const takerUser = await this.userRepo.findById(
        new Uuid(order.user_id.id)
      );
      if (!takerUser) throw new DomainError('Taker não encontrado');
      takerUser.debitUsd(usdTraded + takerFee);
      takerUser.creditBtc(toMatch);
      await this.userRepo.save(takerUser);

      remaining -= toMatch;
    }

    await this.orderRepo.save(order);
  }
}
