import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('product_categories').del();

    // Inserts seed entries
    await knex('product_categories').insert([
        { category: 'Ігрові консолі' },
        { category: 'Ноутбуки' },
        { category: "Персональні комп'ютери" },
        { category: 'Планшети' },
        { category: 'Смартфони' },
        { category: 'HDD' },
        { category: 'SSD' },
        { category: 'Процесори' },
        { category: 'Відеокарти' },
        { category: "Оперативна пам'ять" },
        { category: 'Монітори' },
    ]);
}
