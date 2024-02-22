import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table
            // indicates which warehouse the order should be delivered to
            // this warehouse is associated with some postal service ("Nova Poshta" or "Ukrposhta")
            .integer('delivery_warehouse_id')
            .notNullable()
            .references('id')
            .inTable('postal_service_warehouses')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table.dropColumn('delivery_warehouse_id');
    });
}
