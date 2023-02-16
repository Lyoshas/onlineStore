import {
    it,
    expect,
    describe,
    beforeEach,
    afterEach
} from 'vitest';

import dbPool from '../../util/database';
import loadEnvVariables from '../util/loadEnv';
import { createUserAndReturnId } from '../util/createUser';
import { getUserPrivileges } from '../../models/auth';
import CreateUserOptions from '../interfaces/CreateUserOptions';
import UserPrivileges from '../../interfaces/UserPrivileges';

loadEnvVariables();

beforeEach(async () => {
    await dbPool.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');
});

afterEach(async () => {
    await dbPool.query('ROLLBACK');
});

describe('testing getUserPrivileges', () => {
    async function testFunctionality(inputPrivileges: CreateUserOptions) {
        const userId: number = await createUserAndReturnId(inputPrivileges);

        const userPrivilegesFromDB = await getUserPrivileges(userId);

        expect(
            (userPrivilegesFromDB as UserPrivileges).isAdmin
        ).toMatchObject(inputPrivileges.isAdmin);
    }

    it('should return that a user is an admin', async () => {
        const inputPrivileges: CreateUserOptions = {
            isAdmin: true,
            isActivated: true
        };
        
        testFunctionality(inputPrivileges);
    });

    it('should return that a user is not an admin', async () => {
        const inputPrivileges: CreateUserOptions = {
            isAdmin: false,
            isActivated: true
        };
    
        testFunctionality(inputPrivileges);
    });

    it('should return null if the user does not exist', async () => {
        const userId = 1234567890; // make sure a user with this id doesn't exist

        const outputPrivileges = await getUserPrivileges(userId);

        expect(outputPrivileges).toBeNull();
    });
});
