import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('cities').del();

    const cities = [
        'Київ',
        'Львів',
        'Тернопіль',
        'Запоріжжя',
        'Харків',
        'Херсон',
        'Миколаїв',
        'Чернівці',
        'Житомир',
        'Луцьк',
        'Дніпро',
    ];

    // Inserts seed entries
    await knex('cities').insert(cities.map((city) => ({ name: city })));
}
