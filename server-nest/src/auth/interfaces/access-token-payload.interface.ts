import { UserRole } from '../enums/user-role.enum';

export interface AccessTokenPayload {
    id: number;
    email: string;
    role: UserRole;
}
