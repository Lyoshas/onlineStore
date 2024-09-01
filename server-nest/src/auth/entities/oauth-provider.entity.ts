import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OAuthState } from './oauth-state.entity';
import { OAuthProvider as OAuthProviderEnum } from '../enums/oauth-provider.enum';

@Entity('oauth_providers')
export class OAuthProvider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    name: OAuthProviderEnum;

    @OneToMany(() => OAuthState, (oauthState) => oauthState.oauthProvider)
    states: OAuthState[];
}
