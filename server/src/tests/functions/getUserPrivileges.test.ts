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
import UserPrivileges from '../../interfaces/UserPrivileges';

loadEnvVariables();

beforeEach(async () => {
    await dbPool.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');
});

afterEach(async () => {
    await dbPool.query('ROLLBACK');
});

describe('testing getUserPrivileges', () => {
    async function testFunctionality(inputPrivileges: UserPrivileges) {
        const userId: number = await createUserAndReturnId(inputPrivileges);

        const userPrivilegesFromDB = await getUserPrivileges(userId);

        expect(userPrivilegesFromDB).toMatchObject(inputPrivileges);
    }

    it('should return that a user is admin and is activated', async () => {
        const inputPrivileges: UserPrivileges = {
            isAdmin: true,
            isActivated: true
        };
        
        testFunctionality(inputPrivileges);
    });

    it('should return that a user is admin but not activated', async () => {
        const inputPrivileges: UserPrivileges = {
            isAdmin: true,
            isActivated: false
        };
    
        testFunctionality(inputPrivileges);
    });

    it('should return that a user is not an admin but is activated', async () => {
        const inputPrivileges: UserPrivileges = {
            isAdmin: false,
            isActivated: true
        };

        testFunctionality(inputPrivileges);
    });

    it('should return that a user is not an admin and is not activated', async () => {
        const inputPrivileges: UserPrivileges = {
            isAdmin: false,
            isActivated: false
        };

        testFunctionality(inputPrivileges);
    });

    it('should return null if the user does not exist', async () => {
        const userId = 1234567890; // make sure a user with this id doesn't exist

        const outputPrivileges = await getUserPrivileges(userId);

        expect(outputPrivileges).toBeNull();
    });
});
