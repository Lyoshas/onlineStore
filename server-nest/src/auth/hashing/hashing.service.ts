import { Injectable } from '@nestjs/common';

// this abstract class specifies what functionality must be implemented by a concrete hashing service
// this way, if this application uses another hashing algorithm at some point in the future, the interface will remain the same
@Injectable()
export abstract class HashingService {
    abstract hash(data: string): Promise<string>;
    abstract compare(plaintext: string, hash: string): Promise<boolean>;
}
