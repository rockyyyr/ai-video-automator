export const REMOTE_HOST = 'tahr-precious-lemur.ngrok-free.app';

export const isRemote = () => window.location.hostname === REMOTE_HOST;

export const transformHost = (url = '') => {
    return isRemote()
        ? url.replace(/^https?/, 'https').replace('host.docker.internal:9000', REMOTE_HOST)
        : url.replace('host.docker.internal', window.location.hostname);
};
