import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as shippingModel from '../models/shipping.js';

export const getWarehousesByCity: RequestHandler<
    unknown,
    unknown,
    unknown,
    { city: string }
> = asyncHandler(async (req, res, next) => {
    const { dbStream, dbClient } =
        await shippingModel.getNovaPoshtaWarehousesByCityViaDB(req.query.city);

    res.writeHead(200, { 'Content-Type': 'application/json' });

    // we're going to send data to the client gradually, using streams
    // in order to avoid loading the whole data into RAM
    res.write('{ "warehouses": [');
    let firstIteration = true;

    dbStream.on('data', (chunk: { warehouse_description: string }) => {
        if (firstIteration) firstIteration = false;
        else res.write(',');

        // escaping necessary characters in "description" for JSON validity
        let description = `"${chunk.warehouse_description
            .replace(/\\/, '\\\\')
            .replace(/"/g, '\\"')}"`;

        // writing the data to the internal buffer
        const shouldContinue = res.write(description);
        // if the internal buffer is full, wait until the buffer is emptied
        if (!shouldContinue) dbStream.pause();
    });

    // when the internal buffer of the writable stream "res" is empty,
    // resume the dbStream
    res.on('drain', () => {
        dbStream.resume();
    });

    dbStream.on('end', () => {
        res.end('] }');
        dbClient.release();
    });

    dbStream.on('error', () => {
        res.destroy();
        dbClient.release();
    });
});
