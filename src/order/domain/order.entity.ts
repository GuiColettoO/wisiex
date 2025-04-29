import { TypeOrder } from '../../@shared/domain/enums/type-order.enum';
import { DomainError } from '../../@shared/domain/validators/domain.error';
import { EntityValidationError } from '../../@shared/domain/validators/validation.error';
import { Price } from '../../@shared/domain/value-objects/price/price.vo';
import { Quantity } from '../../@shared/domain/value-objects/quantity/quantity.vo';
import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { StatusOrder } from './enum/status-order.enum';
import { OrderValidatorFactory } from './order.validator';

type OrderConstructorProps = {
  order_id?: Uuid;
  user_id: Uuid;
  type: TypeOrder;
  price: number;
  amount: number;
  filledAmount?: number;
  status?: StatusOrder;
  created_at?: Date;
  updated_at?: Date;
};

type OrderCreateProps = {
  user_id: Uuid;
  type: TypeOrder;
  price: number;
  amount: number;
};

type OrderProps = OrderCreateProps & {
  order_id?: Uuid;
  filledAmount?: number;
  status?: StatusOrder;
  created_at?: Date;
  updated_at?: Date;
};

export class Order {
  order_id: Uuid;
  user_id: Uuid;
  type: TypeOrder;
  price: Price;
  amount: Quantity;
  filledAmount: Quantity;
  status: StatusOrder;
  created_at: Date;
  updated_at?: Date | null;

  constructor(props: OrderConstructorProps) {
    this.order_id = props.order_id ?? new Uuid();
    this.user_id = props.user_id;
    this.type = props.type;
    this.price = new Price(props.price);
    this.amount = new Quantity(props.amount);
    this.filledAmount = props.filledAmount
      ? new Quantity(props.filledAmount)
      : new Quantity(0);
    this.status = props.status ?? StatusOrder.OPEN;
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? null;
  }

  static create(props: OrderCreateProps): Order {
    const order = new Order(props);
    Order.validate(order);
    return order;
  }

  static reconstitute(props: OrderProps): Order {
    const order = new Order(props);
    Order.validate(order);
    return order;
  }

  fill(amountToFill: number): void {
    if (
      this.status === StatusOrder.CANCELLED ||
      this.status === StatusOrder.FILLED
    ) {
      throw new DomainError('Cannot fill a non-open order');
    }
    const toFill = new Quantity(amountToFill);

    const remaining = this.amount.subtract(this.filledAmount);
    if (toFill.value > remaining.value) {
      throw new DomainError('Fill amount exceeds remaining quantity');
    }

    this.filledAmount = this.filledAmount.add(toFill);

    this.status =
      this.filledAmount.value === this.amount.value
        ? StatusOrder.FILLED
        : StatusOrder.PARTIAL;

    this.updated_at = new Date();
  }

  cancel() {
    if (
      this.status === StatusOrder.FILLED ||
      this.status === StatusOrder.CANCELLED
    ) {
      throw new Error('Cannot cancel a completed order');
    }
    this.status = StatusOrder.CANCELLED;
  }

  static validate(entity: Order) {
    const validator = OrderValidatorFactory.create();
    const isValid = validator.validate(entity);
    if (!isValid) {
      throw new EntityValidationError(validator.errors!);
    }
  }

  toJSON() {
    return {
      order_id: this.order_id.id,
      user_id: this.user_id.id,
      type: this.type,
      price: this.price,
      amount: this.amount,
      filledAmount: this.filledAmount,
      status: this.status,
      created_at: this.created_at,
    };
  }
}
