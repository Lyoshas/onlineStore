import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 254, unique: true })
    email: string;

    @Column({ length: 72 })
    password: string;

    @Column({ length: 50 })
    firstName: string;

    @Column({ length: 50 })
    lastName: string;

    @Column({ default: false })
    isActivated: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
