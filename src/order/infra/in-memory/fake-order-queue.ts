import { Order } from "../../domain/order.entity";
import { IOrderQueue } from "../../domain/order.interface.repository";


export class FakeOrderQueue implements IOrderQueue {
  private buffer: Order[] = [];

  async enqueue(order: Order): Promise<void> {
    this.buffer.push(order);
  }
  async dequeue(): Promise<Order | null> {
    return this.buffer.shift() || null;
  }

  getBuffer(): Order[] {
    return [...this.buffer];
  }
}