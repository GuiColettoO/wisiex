import { IOrderRepository } from "../../domain/order.interface.repository";

export type BookItem = { price: number; volume: number };

export class GetOrderBookUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(): Promise<{ bids: BookItem[]; asks: BookItem[] }> {
    const buys = await this.orderRepo.findOpenBuys();
    const sells = await this.orderRepo.findOpenSells();

    const aggregate = (orders: any[]) => {
      const map = new Map<number, number>();
      orders.forEach(o => {
        const price = o.price.value;
        const remaining = o.amount.value - (o as any).filled_amount.value;
        map.set(price, (map.get(price) || 0) + remaining);
      });
      return Array.from(map.entries())
        .map(([price, volume]) => ({ price, volume }));
    };

    const bids = aggregate(buys).sort((a, b) => b.price - a.price);
    const asks = aggregate(sells).sort((a, b) => a.price - b.price);
    return { bids, asks };
  }
}