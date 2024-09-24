import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Injectable()
export class ProductReviewPipe implements PipeTransform {
    async transform(value: string, metadata: ArgumentMetadata) {
        if (value.length > 0 && value.length <= 2000) return value;
        throw new GraphQLError(
            'reviewMessage length must be between 1 and 2000 characters'
        );
    }
}
