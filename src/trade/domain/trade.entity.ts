import { EntityValidationError } from '../../@shared/domain/validators/validation.error';
import { Price } from '../../@shared/domain/value-objects/price/price.vo';
import { Quantity } from '../../@shared/domain/value-objects/quantity/quantity.vo';
import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { Fee } from './value-object/fee.vo';

type TradeConstructorProps = {
  trade_id?: Uuid;
  buy_order_id: Uuid;
  sell_order_id: Uuid;
  price: number;
  amount: number;
  makerFee: number;
  takerFee: number;
  executed_at?: Date;
};

type TradeCreateProps = {
  buy_order_id: Uuid;
  sell_order_id: Uuid;
  price: number;
  amount: number;
  makerFee: number;
  takerFee: number;
};

type TradeProps = TradeCreateProps & {
  trade_id: Uuid;
  executed_at: Date;
};

export class Trade {
  trade_id: Uuid;
  buy_order_id: Uuid;
  sell_order_id: Uuid;
  price: Price;
  amount: Quantity;
  makerFee: Fee;
  takerFee: Fee;
  executed_at: Date;

  constructor(props: TradeConstructorProps) {
    this.trade_id = props.trade_id ?? new Uuid();
    this.buy_order_id = props.buy_order_id;
    this.sell_order_id = props.sell_order_id;
    this.price = new Price(props.price);
    this.amount = new Quantity(props.amount);
    this.makerFee = new Fee(props.makerFee);
    this.takerFee = new Fee(props.takerFee);
    this.executed_at = props.executed_at ?? new Date();
  }

  static create(props: TradeCreateProps): Trade {
    return new Trade(props);
  }

  static reconstitute(props: TradeProps): Trade {
    return new Trade(props);
  }

  toJSON() {
    return {
      trade_id: this.trade_id.id,
      buy_order_id: this.buy_order_id.id,
      sell_order_id: this.sell_order_id.id,
      price: this.price.value,
      amount: this.amount.value,
      makerFee: this.makerFee.value,
      takerFee: this.takerFee.value,
      executed_at: this.executed_at,
    };
  }
}
