import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Seedable } from '../interfaces/seedable.interface';
import { User } from '../../auth/entities/user.entity';
import { UserRole as UserRoleEnum } from '../../auth/enums/user-role.enum';
import { PasswordService } from '../../auth/password/password.service';
import { HashingService } from '../../auth/hashing/hashing.service';
import { UserRole } from '../../auth/entities/user-role.entity';
import { EnvironmentVariables } from 'src/env-schema';

export class UserSeeder implements Seedable {
    private readonly users: {
        email: string;
        plaintextPassword: string;
        firstName: string;
        lastName: string;
        isActivated: boolean;
        role: UserRoleEnum;
    }[] = [];

    constructor(
        private readonly passwordService: PasswordService,
        private readonly configService: ConfigService<EnvironmentVariables>,
        private readonly hashingService: HashingService
    ) {
        this.users = [
            // adding an administrator
            {
                email: this.configService.get<string>(
                    'DB_SEEDING_ADMIN_EMAIL'
                )!,
                plaintextPassword: this.configService.get<string>(
                    'DB_SEEDING_ADMIN_PASSWORD'
                )!,
                firstName: this.configService.get<string>(
                    'DB_SEEDING_ADMIN_FIRST_NAME'
                )!,
                lastName: this.configService.get<string>(
                    'DB_SEEDING_ADMIN_LAST_NAME'
                )!,
                isActivated: true,
                role: UserRoleEnum.ADMIN_USER,
            },
            {
                email: 'olga.kovale@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ольга',
                lastName: 'Коваленко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'ivan.petrov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Іван',
                lastName: 'Петров',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'marina.lysenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марина',
                lastName: 'Лисенко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'andriy.shevchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Андрій',
                lastName: 'Шевченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'nataliya.marchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Наталія',
                lastName: 'Марченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergey.melnik@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Мельник',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'anna.lebedeva@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Анна',
                lastName: 'Лебедєва',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oleksandr.koval@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Олександр',
                lastName: 'Коваль',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'mariya.popova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марія',
                lastName: 'Попова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oleg.kozlov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Олег',
                lastName: 'Козлов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'marina.marchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марина',
                lastName: 'Марченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'volodymyr.sidorov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Володимир',
                lastName: 'Сидоров',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oksana.kovalenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Оксана',
                lastName: 'Коваленко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergiy.dmytruk@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Дмитрук',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'nina.karpenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ніна',
                lastName: 'Карпенко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'pavlo.romanov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Павло',
                lastName: 'Романов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'elena.shcherbak@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Олена',
                lastName: 'Щербак',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'mykola.vorobiov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Микола',
                lastName: 'Воробйов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'yulia.savchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Юлія',
                lastName: 'Савченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'vladimir.maksymov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Володимир',
                lastName: 'Максимов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergey.ivanov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Іванов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'olga.kuznetsova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ольга',
                lastName: 'Кузнецова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'viktor.semionov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Віктор',
                lastName: 'Семенов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'margarita.ivanova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Маргарита',
                lastName: 'Іванова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'ivan.kolosov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Іван',
                lastName: 'Колосов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oksana.ponomarenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Оксана',
                lastName: 'Пономаренко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergiy.romanenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Романенко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'nina.kudryavtseva@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ніна',
                lastName: 'Кудрявцева',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'vadim.titov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Вадим',
                lastName: 'Титов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'olena.romanova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Олена',
                lastName: 'Романова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'petro.ostapov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Петро',
                lastName: 'Остапов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'maria.smirnova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марія',
                lastName: 'Смирнова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'andriy.pavlov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Андрій',
                lastName: 'Павлов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'daria.stepanova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Дарія',
                lastName: 'Степанова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oleg.manelenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Олег',
                lastName: 'Манеленко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'tatyana.bogdanova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Тетяна',
                lastName: 'Богданова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergey.pavlenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Павленко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'marina.popova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марина',
                lastName: 'Попова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'andriy.kovalenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Андрій',
                lastName: 'Коваленко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oksana.melnikova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Оксана',
                lastName: 'Мельникова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergiy.pavlov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Павлов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'nina.sidorova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ніна',
                lastName: 'Сидорова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'volodymyr.karpenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Володимир',
                lastName: 'Карпенко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'anna.dmytruk@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Анна',
                lastName: 'Дмитрук',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oleksandr.kudryavtsev@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Олександр',
                lastName: 'Кудрявцев',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'mariya.titova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марія',
                lastName: 'Титова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergey.savchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Савченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'nina.petrov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ніна',
                lastName: 'Петрова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'mykola.danylyuk@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Микола',
                lastName: 'Данилюк',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'larysa.kovalchuk@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Лариса',
                lastName: 'Ковальчук',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'andriy.kozlovsky@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Андрій',
                lastName: 'Козловський',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'oksana.shevchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Оксана',
                lastName: 'Шевченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'mykola.petrov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Микола',
                lastName: 'Петров',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'olga.kravchenko@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Ольга',
                lastName: 'Кравченко',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'sergey.ivanchuk@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Сергій',
                lastName: 'Іванчук',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'maria.kozlova@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Марія',
                lastName: 'Козлова',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'dmytro.romanov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Дмитро',
                lastName: 'Романов',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'anna.melnyk@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Анна',
                lastName: 'Мельник',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
            {
                email: 'vadim.shcherbakov@gmail.com',
                plaintextPassword:
                    this.passwordService.generateStrongPassword(),
                firstName: 'Вадим',
                lastName: 'Щербаков',
                isActivated: true,
                role: UserRoleEnum.BASIC_USER,
            },
        ];
    }

    async seed(manager: EntityManager): Promise<void> {
        await manager.delete(User, {});

        const readyUsers = await Promise.all(
            this.users.map(async (user) => ({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: await this.hashingService.hash(
                    user.plaintextPassword
                ),
                isActivated: user.isActivated,
                // using "findOneOrByFail" isn't the best approach, because it
                // would require making a SQL query for every user but utilizing
                // the TypeORM query builder would require an unreasonable
                // amount of development time and the code would look less readable;
                // since this seeder is only for development purposes, so introducing
                // a ~100ms delay isn't a big problem in this case
                role: await manager.findOneByOrFail(UserRole, {
                    role: user.role,
                }),
            }))
        );

        await manager.insert(User, readyUsers);
    }
}
