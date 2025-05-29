import Axios from 'axios';

const api = Axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    }
});

api.interceptors.response.use(
    (response) => response.data,
    error => Promise.reject(error)
);

export default api;