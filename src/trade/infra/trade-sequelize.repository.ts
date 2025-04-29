import { Trade } from "../domain/trade.entity";
import { TradeModel } from "./trade.model";
import { TradeModelMapper } from "./trade-model.mapper";
import { InfraError } from "../../@shared/infra/errors/infra.error";
import { ITradeRepository } from "../domain/trade.interface.repository";
import { Uuid } from "../../@shared/domain/value-objects/uuid/uuid.vo";
import { Op } from "sequelize";

export class TradeSequelizeRepository implements ITradeRepository {
  constructor(private readonly tradeModel: typeof TradeModel) {}

  async save(trade: Trade): Promise<void> {
    try {
      const modelProps = TradeModelMapper.toModel(trade).toJSON();
      const sequelize = this.tradeModel.sequelize;
      await sequelize.transaction(async (t) => {
        await this.tradeModel.create(modelProps, { transaction: t });
      });
    } catch (err) {
      throw new InfraError('TradeRepository.save failed', err);
    }
  }

  async findById(trade_id: Uuid): Promise<Trade | null> {
    try {
      const modelProps = await this.tradeModel.findByPk(trade_id.id);
      return modelProps ? TradeModelMapper.toEntity(modelProps) : null;
    } catch (err) {
      throw new InfraError('TradeRepository.findById failed', err);
    }
  }

  async findByOrderId(order_id: Uuid): Promise<Trade[]> {
    try {
      const modelsProps = await this.tradeModel.findAll({
        where: {
          [Op.or]: [
            { buy_order_id: order_id.id },
            { sell_order_id: order_id.id }
          ]
        },
        order: [['executed_at', 'DESC']],
      });
      return modelsProps.map(m => TradeModelMapper.toEntity(m));
    } catch (err) {
      throw new InfraError('TradeRepository.findByOrderId failed', err);
    }
  }

  async findRecent(limit: number): Promise<Trade[]> {
    try {
      const modelsProps = await this.tradeModel.findAll({
        order: [['executed_at', 'DESC']],
        limit,
      });
      return modelsProps.map(m => TradeModelMapper.toEntity(m));
    } catch (err) {
      throw new InfraError('TradeRepository.findRecent failed', err);
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<Trade[]> {
    try {
      const modelsProps = await this.tradeModel.findAll({
        where: {
          executed_at: {
            [Op.between]: [from, to]
          }
        }
      });
      return modelsProps.map(m => TradeModelMapper.toEntity(m));
    } catch (err) {
      throw new InfraError('TradeRepository.findByDateRange failed', err);
    }
  }
}
