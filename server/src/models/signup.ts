import { Pool, PoolClient } from 'pg';
import bcryptjs from 'bcryptjs';

import dbPool from '../services/postgres.service.js';

class SignupModel {
    private dbClient: PoolClient | Pool;

    constructor(dbClient?: PoolClient) {
        this.dbClient = dbClient || dbPool;
    }

    public async signUpUser(options: {
        firstName: string;
        lastName: string;
        email: string;
        hashedPassword: string;
        isActivated?: boolean;
    }): Promise<number> {
        const {
            firstName,
            lastName,
            email,
            hashedPassword,
            isActivated = false,
        } = options;

        const { rows } = await this.dbClient.query<{ id: number }>(
            `
                INSERT INTO users (
                    email,
                    password,
                    first_name,
                    last_name,
                    is_activated
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `,
            [email, hashedPassword, firstName, lastName, isActivated]
        );

        return rows[0].id;
    }

    public async isEmailAvailable(email: string) {
        const { rows } = await this.dbClient.query(
            `
                SELECT EXISTS(
                    SELECT 1 FROM users WHERE email = $1
                )
            `,
            [email]
        );

        return !rows[0].exists;
    }

    // This function is used when the backend application creates a password on
    // behalf of a user.
    // Possible use cases:
    // - user signed up with their google account
    // - anonymous user created an order, so the system creates an account for this
    // user and sends the generated password to the user's email
    static generateStrongPassword() {
        // get a random integer from min to max
        function randomInteger(min: number, max: number) {
            let rand = min - 0.5 + Math.random() * (max - min + 1);
            return Math.round(rand);
        }

        function getRandomElement(array: any[] | string) {
            return array[randomInteger(0, array.length - 1)];
        }

        function shuffle(array: any[]) {
            let currentIndex = array.length,
                randomIndex;

            // While there remain elements to shuffle.
            while (currentIndex != 0) {
                // Pick a remaining element.
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex],
                    array[currentIndex],
                ];
            }

            return array;
        }

        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseLetters = lowercaseLetters.toUpperCase();
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()~_+}{":>?<,./\'";][\\`-=';

        let strongPassword = '';

        for (let i = 0; i < randomInteger(5, 10); i++) {
            strongPassword +=
                getRandomElement(lowercaseLetters) +
                getRandomElement(uppercaseLetters) +
                getRandomElement(numbers) +
                getRandomElement(symbols);
        }

        strongPassword = shuffle(strongPassword.split('')).join('');
        return strongPassword;
    }

    static hashPassword(plaintextPassword: string): Promise<string> {
        return bcryptjs.hash(plaintextPassword, 12);
    }
}

export default SignupModel;
