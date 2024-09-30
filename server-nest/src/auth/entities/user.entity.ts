import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 254, unique: true })
	email: string;

	@Column({ type: 'varchar', length: 72 })
	password: string;

	@Column({ type: 'varchar', length: 50 })
	firstName: string;

	@Column({ type: 'varchar', length: 50 })
	lastName: string;

	@Column({ type: 'boolean', default: false })
	isActivated: boolean;

	@ManyToOne(() => UserRole, (userRole) => userRole.users, {
		nullable: false,
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	role: UserRole;

	@OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
	refreshTokens: RefreshToken[];

	@CreateDateColumn()
	createdAt: Date;
}
