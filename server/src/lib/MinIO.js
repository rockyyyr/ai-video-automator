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

export async function save(fileName, savable) {
    try {
        await minio.putObject(
            MINIO_BUCKET_NAME,
            fileName,
            savable
        );

        return url(fileName);

    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

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

export function removeBatch(fileNames) {
    return minio.removeObjects(
        MINIO_BUCKET_NAME,
        fileNames
    );
}

export function removeObject(fileName) {
    return minio.removeObject(
        MINIO_BUCKET_NAME,
        fileName
    );
}

export function copyObject(sourceFileName, destFileName) {
    return minio.copyObject(
        MINIO_BUCKET_NAME,
        destFileName,
        `/${MINIO_BUCKET_NAME}/${sourceFileName}`
    );
}

export async function renameObject(sourceFileName, newFileName) {
    const src = safeFileName(getFileName(sourceFileName));
    const dest = safeFileName(getFileName(newFileName));

    await copyObject(src, dest);
    await removeObject(src);

    return url(dest);
}

function safeFileName(str) {
    return str
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, '_') // replace invalid chars with underscore
        .replace(/_+/g, '_');
}

function getFileName(url) {
    return url.split('/').pop();
}
