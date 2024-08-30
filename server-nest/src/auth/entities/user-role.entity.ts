import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_roles')
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 30, unique: true })
    role: string;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
