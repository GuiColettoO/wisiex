import Redis from "ioredis";
import { Order } from "../domain/order.entity";
import { IOrderQueue } from "../domain/order.interface.repository";
import { OrderModelMapper } from "./order-model.mapper";


export class RedisOrderQueue implements IOrderQueue {
  private client: Redis;
  private readonly queueKey = 'order_queue';

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl);
  }

  async enqueue(order: Order): Promise<void> {
    const payload = JSON.stringify(OrderModelMapper.toModel(order));
    await this.client.lpush(this.queueKey, payload);
  }


  async dequeue(): Promise<Order | null> {
    const result = await this.client.brpop(this.queueKey, 0);
    if (!result) return null;
    const [, payload] = result;
    const dto = JSON.parse(payload);
    return OrderModelMapper.toEntity(dto);
  }
}