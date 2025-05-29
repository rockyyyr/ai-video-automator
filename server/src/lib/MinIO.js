const { MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME } = process.env;
import * as Minio from 'minio';
import { PassThrough } from 'stream';

const minio = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: 9000,
    useSSL: false,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});

const url = fileName => `http://host.docker.internal:9000/${MINIO_BUCKET_NAME}/${fileName}`;

export async function saveFromFile(fileName, filePath) {
    try {
        await minio.fPutObject(
            MINIO_BUCKET_NAME,
            fileName,
            filePath
        );

        return url(fileName);

    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export async function saveFromBase64(fileName, base64Data) {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        await minio.putObject(
            MINIO_BUCKET_NAME,
            fileName,
            buffer
        );

        return url(fileName);

    } catch (error) {
        console.error('Error uploading base64 data:', error);
        throw error;
    }
}

export async function saveFromStream(fileName, stream) {
    const passthrough = new PassThrough();
    stream.pipe(passthrough);
    try {
        await minio.putObject(
            MINIO_BUCKET_NAME,
            fileName,
            passthrough
        );

        return url(fileName);

    } catch (error) {
        console.error('Error uploading from stream:', error);
        throw error;
    }
}

export function download(fileName, downloadPath) {
    return minio.fGetObject(
        MINIO_BUCKET_NAME,
        fileName,
        downloadPath,
    );
}