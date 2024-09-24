import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Injectable()
export class StarRatingPipe implements PipeTransform {
    async transform(value: number, metadata: ArgumentMetadata) {
        if (value >= 1 && value <= 5 && value % 0.5 === 0) return value;
        throw new GraphQLError(
            'starRating must be between 1 and 5, inclusive, in increments of 0.5'
        );
    }
}
