import { Uuid } from '../../@shared/domain/value-objects/uuid/uuid.vo';
import { User } from './user.entity';

export interface IUserRepository {
  save(user: User): Promise<void>;

  findById(user_id: Uuid): Promise<User | null>;

  findByUsername(username: string): Promise<User | null>;
}
