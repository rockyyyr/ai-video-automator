const { BASEROW_URL, BASEROW_TOKEN, BASEROW_VIDEOS_TABLE_ID, BASEROW_SCENES_TABLE_ID, BASEROW_CAPTION_PROFILE_TABLE_ID } = process.env;

import Axios from 'axios';
import qs from 'qs';

const api = Axios.create({
    baseURL: BASEROW_URL,
    headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
    }
});

api.interceptors.response.use(
    (response) => response.data,
    error => Promise.reject(error.response?.data)
);

const DEFAULT_FILTER_TYPE = 'equal';

export const Tables = {
    VIDEOS: parseInt(BASEROW_VIDEOS_TABLE_ID),
    SCENES: parseInt(BASEROW_SCENES_TABLE_ID),
    CAPTION_PROFILES: parseInt(BASEROW_CAPTION_PROFILE_TABLE_ID)
};

const makeFilters = filters => {
    return filters
        .map(filter => `filter__${filter.field}__${filter.type || DEFAULT_FILTER_TYPE}=${filter.value}`)
        .join('&');
};

export async function find(tableId, filters, { page, pageSize, orderBy, returning } = { page: 1, pageSize: 100 }) {
    const response = await api.get(
        `/api/database/rows/table/${tableId}/?user_field_names=true&${makeFilters(filters)}&${qs.stringify({
            user_field_names: true,
            page,
            size: pageSize,
            order_by: orderBy,
            include: returning
        })}`
    );
    return response?.results;
}

export function getRow(tableId, rowId) {
    return api.get(`/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`);
}

export function createRow(tableId, data) {
    return api.post(`/api/database/rows/table/${tableId}/?user_field_names=true`, data);
}

export function updateRow(tableId, rowId, data) {
    return api.patch(`/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, data);
}

export function deleteRow(tableId, rowId) {
    return api.delete(`/api/database/rows/table/${tableId}/${rowId}/`);
}

export function deleteBatch(tableId, rowIds) {
    return api.post(`/api/database/rows/table/${tableId}/batch-delete/`, { items: rowIds });
}

