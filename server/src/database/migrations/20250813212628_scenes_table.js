/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
    return knex.schema.createTable('scenes', (table) => {
        table.increments('id').primary();
        table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()'));
        table.integer('Video ID').notNullable().references('id').inTable('videos').onDelete('CASCADE');
        table.integer('Segment #');
        table.decimal('Duration', 5, 2);
        table.text('Script Segment');
        table.text('Image Prompt');
        table.text('Image URL');
        table.text('Clip URL');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
    return knex.schema.dropTableIfExists('scenes');
};
