import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('warranty_request_statuses').del();

    // Inserts seed entries
    await knex('warranty_request_statuses').insert([
        { name: 'Товар зданий у сервіс' },
        { name: 'Сервісний центр оцінює стан товару' },
        {
            name: 'Не було знайдено жодних дефектів; товар очікує клієнта в сервісному центрі',
        },
        { name: 'Йдуть ремонтні роботи' },
        { name: 'Відремонтований товар чекає клієнта в сервісному центрі' },
        { name: 'Товар був успішно отриманий' },
    ]);
}
