import { EntityManager } from 'typeorm';
import { Seedable } from '../interfaces/seedable.interface';
import { UserRole } from '../../auth/entities/user-role.entity';
import { UserRole as UserRoleEnum } from '../../auth/enums/user-role.enum';

export class UserRoleSeeder implements Seedable {
    async seed(manager: EntityManager): Promise<void> {
        await manager.delete(UserRole, {});
        await manager.insert(UserRole, [
            { role: UserRoleEnum.BASIC_USER },
            { role: UserRoleEnum.ADMIN_USER },
        ]);
    }
}
