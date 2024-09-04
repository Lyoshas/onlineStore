import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomService {
    // "min" and "max" included
    randomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
