import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Injectable()
export class ProductPagePipe implements PipeTransform {
    transform(value: number, metadata: ArgumentMetadata) {
        if (value > 0) return value;
        throw new GraphQLError(
            "The 'page' parameter must be greater than zero"
        );
    }
}
