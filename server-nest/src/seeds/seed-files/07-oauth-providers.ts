import { EntityManager } from 'typeorm';
import { Seedable } from '../interfaces/seedable.interface';
import { OAuthProvider } from 'src/auth/entities/oauth-provider.entity';
import { OAuthProvider as OAuthProviderEnum } from 'src/auth/enums/oauth-provider.enum';

export class OAuthProviderSeeder implements Seedable {
    async seed(manager: EntityManager): Promise<void> {
        await manager.delete(OAuthProvider, {});
        await manager.insert(OAuthProvider, [
            { name: OAuthProviderEnum.GOOGLE },
            { name: OAuthProviderEnum.FACEBOOK },
        ]);
    }
}
