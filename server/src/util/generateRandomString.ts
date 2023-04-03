import { randomBytes } from 'crypto';

// this function uses crypto.randomBytes under the hood,
// so if you want to get a random string of length N, use "await generateRandomString(N / 2)"
export const generateRandomString = (
    sizeInBytes: number = 64
): Promise<string> => {
    return new Promise((resolve, reject) => {
        randomBytes(sizeInBytes, (err, buf) => {
            if (err) return reject(err);
            resolve(buf.toString('hex'));
        })
    });
};
