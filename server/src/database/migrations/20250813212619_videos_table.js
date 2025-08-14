/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
    return knex.schema.createTable('videos', (table) => {
        table.increments('id').primary();
        table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()'));
        table.text('Title');
        table.text('Topic');
        table.text('Transcript');
        table.text('Notes');
        table.integer('Duration');
        table.integer('Actual Duration');
        table.string('Generative Style');
        table.string('TTS Voice');
        table.decimal('TTS Speed', 5, 2);
        table.text('Script');
        table.text('Description');
        table.text('Captions');
        table.text('SRT URL');
        table.text('TTS URL');
        table.text('Video Combined Clips URL');
        table.text('Video With Audio URL');
        table.text('Video With Captions URL');
        table.text('Completed Video URL');
        table.integer('Step');
        table.integer('# of Scenes');
        table.integer('Scene Length');
        table.boolean('Error').defaultTo(false);
        table.bigInteger('Timestamp');
        table.integer('captionProfile');
        table.text('Replace Words');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
    return knex.schema.dropTableIfExists('videos');
};
