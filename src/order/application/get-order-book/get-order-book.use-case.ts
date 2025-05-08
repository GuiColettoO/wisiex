import { IOrderRepository } from "../../domain/order.interface.repository";

export class GetOrderBookUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(): Promise<GetOrderBookOutput> {
    const buys = await this.orderRepo.findOpenBuys();
    const sells = await this.orderRepo.findOpenSells();

    const aggregate = (orders: any[]) => {
      const map = new Map<number, number>();
      orders.forEach(o => {
        const remaining = o.amount.value - o.filledAmount.value;
        const price = o.price.value;
        map.set(price, (map.get(price) || 0) + remaining);
      });
      return Array.from(map.entries())
        .map(([price, volume]) => ({ price, volume }));
    };

    const bids = aggregate(buys);
    const asks = aggregate(sells);

    return { bids, asks };
  }
}

export type OrderBookItem = { price: number; volume: number };

export type GetOrderBookOutput = {
  bids: OrderBookItem[];
  asks: OrderBookItem[];
};