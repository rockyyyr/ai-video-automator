/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
    const defaultSettings = {
        line_color: "#FFFFFF",
        word_color: "#22b525",
        max_words_per_line: 3,
        font_size: 80,
        outline_width: 6,
        shadow_offset: 8,
        all_caps: true,
        bold: false,
        italic: false,
        underline: false,
        strikeout: false,
        style: "highlight",
        font_family: "The Bold Font",
        position: "top_center",
    };

    await knex('caption_profiles')
        .where('id', 1)
        .del();

    return knex.insert({ id: 1, profileName: 'Default', settings: JSON.stringify(defaultSettings) }).into('caption_profiles');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
    return knex('caption_profiles')
        .where('id', 1)
        .del();
};
