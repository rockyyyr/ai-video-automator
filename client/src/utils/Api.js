import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

api.interceptors.response.use(
    (response) => response.data,
    error => Promise.reject(error)
);

export function generateVideo(data) {
    return api.post('/video/generate', data);
}

export function restartVideo(videoId) {
    return api.post(`/video/restart`, { videoId });
}

export function getInProgressVideos() {
    return api.get('/video/in-progress');
}

export function getCompletedVideos(page, pageSize) {
    return api.get(`/video/completed?page=${page}&pageSize=${pageSize}`);
}

export function saveProfile(profile) {
    return api.post('/settings/caption-profiles', profile);
}
export function updateProfile(profileId, profile) {
    return api.patch(`/settings/caption-profiles/${profileId}`, profile);
}
export function getCaptionProfiles() {
    return api.get('/settings/caption-profiles');
}

export const deleteVideo = (videoId) => {
    return api.delete('/video/' + videoId);
};

export const deleteImage = (videoId, sceneId) => {
    return api.post(`/image/delete`, { videoId, sceneId });
};
