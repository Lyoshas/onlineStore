import { EntityManager } from 'typeorm';

export interface Seedable {
    seed(manager: EntityManager): Promise<void>;
}
