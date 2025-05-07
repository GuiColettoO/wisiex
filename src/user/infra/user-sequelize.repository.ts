import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { InfraError } from '../../@shared/infra/errors/infra.error';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.interface.repository';
import { UserModelMapper } from './user-model.mapper';
import { UserModel } from './user.model';

export class UserSequelizeRepository implements IUserRepository {
  constructor(private userModel: typeof UserModel) {}

  async save(entity: User): Promise<void> {
    try {
      const modelProps = UserModelMapper.toModel(entity).toJSON();
      await this.userModel.upsert(modelProps);
    }catch (err) {
      throw new InfraError('UserRepository.save failed', err);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const modelProps = await this.userModel.findOne({
        where: { username },
      });
  
      return modelProps ? UserModelMapper.toEntity(modelProps) : null;
    }catch (err) {
      throw new InfraError('UserRepository.findByUsername failed', err);
    }

  }

  async findById(user_id: Uuid): Promise<User | null> {
    try {
      const modelProps = await this._get(user_id.id);
      return modelProps ? UserModelMapper.toEntity(modelProps) : null;
    } catch (err) {
      throw new InfraError('UserRepository.findById failed', err);
    }
  }

  private async _get(id: string) {
    return await this.userModel.findOne({
      where: {
        user_id: id,
      },
    });
  }
}
