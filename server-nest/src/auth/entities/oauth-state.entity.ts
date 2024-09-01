import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OAuthProvider } from './oauth-provider.entity';

@Entity('oauth_states')
export class OAuthState {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 64, unique: true })
    state: string;

    @ManyToOne(() => OAuthProvider, (oauthProvider) => oauthProvider.states, {
        nullable: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    oauthProvider: OAuthProvider;
}
