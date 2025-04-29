import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ClassValidatorFields } from '../../@shared/domain/validators/class-validator-fields';
import { Order } from './order.entity';
import { TypeOrder } from '../../@shared/domain/enums/type-order.enum';

export class OrderRules {
  @IsEnum(TypeOrder)
  @IsNotEmpty()
  type!: TypeOrder;

  constructor({ type }: Order) {
    Object.assign(this, {
      type,
    });
  }
}

export class OrderValidator extends ClassValidatorFields<OrderRules> {
  validate(entity: Order) {
    return super.validate(new OrderRules(entity));
  }
}

export class OrderValidatorFactory {
  static create() {
    return new OrderValidator();
  }
}
