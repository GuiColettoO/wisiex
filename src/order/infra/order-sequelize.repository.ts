import { Uuid } from "../../@shared/domain/value-objects/uuid/uuid.vo";
import { Order } from "../domain/order.entity";
import { IOrderRepository } from "../domain/order.interface.repository";
import { InfraError } from "../../@shared/infra/errors/infra.error";
import { OrderModelMapper } from "./order-model.mapper";
import { OrderModel } from "./order.model";

export class OrderSequelizeRepository implements IOrderRepository {
  constructor(private readonly orderModel: typeof OrderModel) {}

  async save(entity: Order): Promise<void> {
    try {
      const modelProps = OrderModelMapper.toModel(entity).toJSON();
      const sequelize = this.orderModel.sequelize;
      await sequelize.transaction(async (t) => {
        await this.orderModel.upsert(modelProps, { transaction: t });
      });
    } catch (err) {
      throw new InfraError('OrderRepository.save failed', err);
    }
  }

  async findById(order_id: Uuid): Promise<Order | null> {
    try {
      const modelProps = await this.orderModel.findByPk(order_id.id);
      return modelProps ? OrderModelMapper.toEntity(modelProps) : null;
    } catch (err) {
      throw new InfraError('OrderRepository.findById failed', err);
    }
  }

  async findByUser(user_id: Uuid): Promise<Order[]> {
    try {
      const modelsProps = await this.orderModel.findAll({ where: { user_id: user_id.id } });
      return modelsProps.map(m => OrderModelMapper.toEntity(m));
    } catch (err) {
      throw new InfraError('OrderRepository.findByUser failed', err);
    }
  }

  async findOpenBuys(): Promise<Order[]> {
    try {
      const modelsProps = await this.orderModel.findAll({
        where: {
          status: ['OPEN', 'PARTIAL'],
          type: 'BUY',
        },
        order: [['price', 'DESC'], ['created_at', 'ASC']],
      });
      return modelsProps.map(m => OrderModelMapper.toEntity(m));
    } catch (err) {
      throw new InfraError('OrderRepository.findOpenBuys failed', err);
    }
  }

  async findOpenSells(): Promise<Order[]> {
    try {
      const modelsProps = await this.orderModel.findAll({
        where: {
          status: ['OPEN', 'PARTIAL'],
          type: 'SELL',
        },
        order: [['price', 'ASC'], ['created_at', 'ASC']],
      });
      return modelsProps.map(m => OrderModelMapper.toEntity(m));
    } catch (err) {
      throw new InfraError('OrderRepository.findOpenSells failed', err);
    }
  }

  async delete(order: Order): Promise<void> {
    try {
      const sequelize = this.orderModel.sequelize;
      await sequelize.transaction(async (t) => {
        await this.orderModel.destroy({ where: { order_id: order.order_id.id }, transaction: t });
      });
    } catch (err) {
      throw new InfraError('OrderRepository.delete failed', err);
    }
  }
}