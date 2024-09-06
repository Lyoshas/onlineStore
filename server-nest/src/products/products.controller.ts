import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('product')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @ApiOperation({
        description:
            'Returns all possible product categories that are in the database.',
    })
    @ApiTags('Product Categories')
    @ApiOkResponse({
        description: 'The product categories were fetched successfully.',
        schema: {
            type: 'object',
            properties: {
                categories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Product category name',
                            },
                            previewURL: {
                                type: 'string',
                                format: 'url',
                                description: 'Product category preview URL',
                            },
                        },
                    },
                },
            },
        },
        example: {
            categories: [
                {
                    name: 'Ігрові консолі',
                    previewURL:
                        'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/consoles.png',
                },
                {
                    name: 'Ноутбуки',
                    previewURL:
                        'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/laptops.png',
                },
                {
                    name: "Персональні комп'ютери",
                    previewURL:
                        'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/personal-computers.png',
                },
            ],
        },
    })
    @Get('categories')
    async getProductCategories() {
        return {
            categories: await this.productsService.getProductCategories(),
        };
    }
}
