import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { User } from '../domain/user.entity';
import { UserModel } from './user.model';

export class UserModelMapper {
  static toModel(entity: User): UserModel {
    return UserModel.build({
      user_id: entity.user_id.id,
      username: entity.username,
      btc_balance: entity.btc_balance,
      usd_balance: entity.usd_balance,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
    });
  }

  static toEntity(model: UserModel): User {
    const entity = User.reconstitute({
      user_id: new Uuid(model.user_id),
      username: model.username,
      btc_balance: model.btc_balance,
      usd_balance: model.usd_balance,
      created_at: model.created_at,
      updated_at: model.updated_at ?? null,
    });

    return entity;
  }
}
