import BaseProduct from './BaseProduct';

export default interface DisplayProduct extends BaseProduct {
    isAvailable: boolean;
    isRunningOut: boolean;
};
