import { Knex } from 'knex';

// changing the type of "orders"."id" from SERIAL to UUID
export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE orders_products
            DROP CONSTRAINT orders_products_order_id_foreign;
    `);
    await knex.raw(`
        ALTER TABLE order_status_history
            DROP CONSTRAINT order_status_history_order_id_foreign;
    `);
    await knex.raw(`
        ALTER TABLE orders_products
            ALTER COLUMN order_id
            SET DATA TYPE UUID USING (uuid_generate_v4());
    `);
    await knex.raw(`
        ALTER TABLE order_status_history
            ALTER COLUMN order_id
            SET DATA TYPE UUID USING (uuid_generate_v4());
    `);
    await knex.raw(`
        ALTER TABLE orders
            DROP COLUMN id,
            ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    `);
    await knex.raw(`
        ALTER TABLE orders_products
            ADD CONSTRAINT orders_products_order_id_foreign
                FOREIGN KEY (order_id) REFERENCES orders (id)
                ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await knex.raw(`
        ALTER TABLE order_status_history
            ADD CONSTRAINT order_status_history_order_id_foreign
                FOREIGN KEY (order_id) REFERENCES orders (id)
                ON UPDATE CASCADE ON DELETE CASCADE;
    `);
}

// changing the type of "orders"."id" from UUID to SERIAL
export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE orders_products
            DROP CONSTRAINT orders_products_order_id_foreign;
    `);
    await knex.raw(`
        ALTER TABLE order_status_history
            DROP CONSTRAINT order_status_history_order_id_foreign;
    `);
    await knex.raw(`
        ALTER TABLE orders_products
            DROP CONSTRAINT orders_products_pkey,
            DROP COLUMN order_id,
            ADD COLUMN order_id INTEGER NOT NULL,
            ADD PRIMARY KEY (order_id, product_id);
    `);
    await knex.raw(`
        ALTER TABLE order_status_history
            DROP CONSTRAINT order_status_history_pkey,
            DROP COLUMN order_id,
            ADD COLUMN order_id INTEGER NOT NULL,
            ADD PRIMARY KEY (order_id, status_id);
    `);
    await knex.raw(`
        ALTER TABLE orders
            DROP COLUMN id,
            ADD COLUMN id SERIAL PRIMARY KEY;
    `);
    await knex.raw(`
        ALTER TABLE orders_products
            ADD CONSTRAINT orders_products_order_id_foreign
                FOREIGN KEY (order_id) REFERENCES orders (id)
                ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await knex.raw(`
        ALTER TABLE order_status_history
            ADD CONSTRAINT order_status_history_order_id_foreign
                FOREIGN KEY (order_id) REFERENCES orders (id)
                ON UPDATE CASCADE ON DELETE CASCADE;
    `);
}
