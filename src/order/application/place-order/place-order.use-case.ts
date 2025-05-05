import { TypeOrder } from '../../../@shared/domain/enums/type-order.enum';
import { DomainError } from '../../../@shared/domain/validators/domain.error';
import { Uuid } from '../../../@shared/domain/value-objects/uuid/uuid.vo';
import { Trade } from '../../../trade/domain/trade.entity';
import { ITradeRepository } from '../../../trade/domain/trade.interface.repository';
import { IUserRepository } from '../../../user/domain/user.interface.repository';
import { Order } from '../../domain/order.entity';
import { IOrderRepository } from '../../domain/order.interface.repository';

export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly tradeRepo: ITradeRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const order = Order.create({
      user_id: input.userId,
      type: input.type,
      price: input.price,
      amount: input.amount,
    });

    await this.orderRepo.save(order);

    const opposite =
      input.type === TypeOrder.BUY
        ? await this.orderRepo.findOpenSells()
        : await this.orderRepo.findOpenBuys();

    const trades: Trade[] = [];

    for (const bookOrder of opposite) {
      const priceMatch =
        input.type === TypeOrder.BUY
          ? bookOrder.price.value <= order.price.value
          : bookOrder.price.value >= order.price.value;
      if (!priceMatch) break;

      const remainingTaker =
        order.amount.value - order.filledAmount.value;
      const remainingBook =
        bookOrder.amount.value - bookOrder.filledAmount.value;
      const fillQty = Math.min(remainingTaker, remainingBook);

      order.fill(fillQty);
      bookOrder.fill(fillQty);

      await this.orderRepo.save(order);
      await this.orderRepo.save(bookOrder);

      const buyerId =
        input.type === TypeOrder.BUY ? order.user_id : bookOrder.user_id;
      const sellerId =
        input.type === TypeOrder.SELL ? order.user_id : bookOrder.user_id;
      const buyer = await this.userRepo.findById(buyerId);
      const seller = await this.userRepo.findById(sellerId);
      if (!buyer || !seller) throw new DomainError('User not found');

      const tradePrice = bookOrder.price.value;
      const total = fillQty * tradePrice;
      buyer.debitUsd(total);
      buyer.creditBtc(fillQty);
      seller.debitBtc(fillQty);
      seller.creditUsd(total);
      await this.userRepo.save(buyer);
      await this.userRepo.save(seller);

      const trade = Trade.create({
        buy_order_id:
          input.type === TypeOrder.BUY ? order.order_id : bookOrder.order_id,
        sell_order_id:
          input.type === TypeOrder.SELL ? order.order_id : bookOrder.order_id,
        price: tradePrice,
        amount: fillQty,
        makerFee: 0.5,
        takerFee: 0.3,
      });
      await this.tradeRepo.save(trade);
      trades.push(trade);

      if ((order as any).status === 'FILLED') break;
    }

    return { order, trades };
  }
}

export type PlaceOrderInput = {
  userId: Uuid;
  type: TypeOrder;
  price: number;
  amount: number;
};

export type PlaceOrderOutput = {
  order: Order;
  trades: Trade[];
};
