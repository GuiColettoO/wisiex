import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { Trade } from '../domain/trade.entity';
import { TradeModel } from './trade.model';

export class TradeModelMapper {
  static toModel(entity: Trade): TradeModel {
    return TradeModel.build({
      trade_id: entity.trade_id.id,
      price: entity.price.value,
      amount: entity.amount.value,
      makerFee: entity.makerFee.value,
      takerFee: entity.takerFee.value,
      executed_at: entity.executed_at,
      buy_order_id: entity.buy_order_id.id,
      sell_order_id: entity.sell_order_id.id,
    });
  }

  static toEntity(model: TradeModel): Trade {
    const entity = Trade.reconstitute({
      trade_id: new Uuid(model.trade_id),
      price: model.price,
      amount: model.amount,
      makerFee: model.makerFee,
      takerFee: model.takerFee,
      executed_at: model.executed_at,
      buy_order_id: new Uuid(model.buy_order_id),
      sell_order_id: new Uuid(model.sell_order_id),
    });

    return entity;
  }
}
