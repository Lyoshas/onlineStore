import { RequestHandler } from 'express';

export default interface Controller {
    [prop: string]: RequestHandler
};
