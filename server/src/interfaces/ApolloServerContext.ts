import VerifiedUserInfo from './VerifiedUserInfo';

export default interface ApolloServerContext {
    user: VerifiedUserInfo | null;
}
