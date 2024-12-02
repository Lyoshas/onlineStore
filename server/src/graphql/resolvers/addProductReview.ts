import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import validateUser from '../validators/validateUser.js';
import checkProductExistence from '../validators/checkProductExistence.js';
import checkReviewMessage from '../validators/checkReviewMessage.js';
import checkStarRating from '../validators/checkStarRating.js';
import checkPreviousProductReview from '../validators/checkPreviousProductReview.js';
import { addProductReview as addProductReviewToDB } from '../../models/product-review.js';

interface GraphqlAddProductReviewArgs {
    productId: number;
    reviewMessage: string;
    starRating: number;
}

async function addProductReview(
    _: any,
    args: GraphqlAddProductReviewArgs,
    context: ApolloServerContext
): Promise<{ productId: number; userId: number }> {
    await validateUser(context.user, {
        // don't check the activation status because access tokens aren't issued to users who aren't activated
        checkIsActivated: false,
        checkIsAdmin: false,
    });

    const { productId, reviewMessage, starRating } = args;
    const userId = context.user!.id;

    await checkProductExistence(productId);
    // if the user left a review to the same product, throw an error
    await checkPreviousProductReview(productId, userId);
    checkReviewMessage(reviewMessage);
    checkStarRating(starRating);

    await addProductReviewToDB(productId, userId, reviewMessage, starRating);

    return { productId, userId };
}

export default addProductReview;
