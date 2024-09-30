import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 64, unique: true })
	token: string;

	// the 'ManyToOne' decorator is used on a table that will store the corresponding foreign key
	@ManyToOne(() => User, (user) => user.refreshTokens, {
		nullable: false,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: User;

	@Column({ type: 'timestamp' })
	expiresAt: Date;
}
