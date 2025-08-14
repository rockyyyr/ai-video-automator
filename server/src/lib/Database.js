import db from '../database/index.js';

export const Tables = {
    VIDEOS: 'videos',
    SCENES: 'scenes',
    CAPTION_PROFILES: 'caption_profiles'
};

function createWhereFilters(builder, filters) {
    filters.forEach(filter => {
        if (filter.type === 'not_empty') {
            builder.whereNotNull(filter.field);

        } else if (filter.type === 'empty') {
            builder.whereNull(filter.field);

        } else if (filter.type === 'not_equal') {
            builder.whereNot(filter.field, filter.value);

        } else {
            builder.where(filter.field, filter.value);
        }
    });
    return builder;
}

export async function find(tableId, filters, { page, pageSize, orderBy, orderByDirection = 'desc', returning } = { page: 1, pageSize: 100 }) {
    return db
        .select()
        .from(tableId)
        .where(builder => createWhereFilters(builder, filters))
        .modify(q => {
            if (orderBy) q.orderBy(orderBy, orderByDirection);
            if (returning) q.returning(returning);
            if (page && pageSize) q.limit(pageSize).offset((page - 1) * pageSize);
        });
}

export function getRow(tableId, rowId) {
    return db
        .select()
        .from(tableId)
        .where('id', rowId)
        .first();
}

export async function createRow(tableId, data) {
    return db
        .insert(data)
        .into(tableId)
        .returning('*')
        .then(rows => rows[0]);
}

export async function updateRow(tableId, rowId, data) {
    return db(tableId)
        .where('id', rowId)
        .update(data)
        .returning('*')
        .then(rows => rows[0]);
}

export async function updateBatch(tableId, rowIds, data) {
    return db(tableId)
        .whereIn('id', rowIds)
        .update(data)
        .returning('*')
        .then(rows => rows);
}

export function deleteRow(tableId, rowId) {
    return db(tableId)
        .where('id', rowId)
        .del();
}

export function deleteBatch(tableId, rowIds) {
    return db(tableId)
        .whereIn('id', rowIds)
        .del();
}

export function videosWithScenes(filters, { page, pageSize } = { page: 1, pageSize: 100 }) {
    return db
        .select([
            'v.*',
            db.raw(`
                COALESCE(
                  json_agg(row_to_json(s) ORDER BY s."Segment #") FILTER (WHERE s.id IS NOT NULL),
                  '[]'::json
                ) AS scenes
              `)
        ])
        .from(Tables.VIDEOS + ' as v')
        .leftJoin(Tables.SCENES + ' as s', 's.Video ID', 'v.id')
        .where(builder => createWhereFilters(builder, filters))
        .groupBy('v.id')
        .orderBy([
            { column: 'v.Step', order: 'desc' },
            { column: 'v.Timestamp', order: 'desc' }
        ])
        .limit(pageSize)
        .offset((page - 1) * pageSize);
}

export async function raw(query) {
    return db.raw(query).then(r => r.rows);
}
