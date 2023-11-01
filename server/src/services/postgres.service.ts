import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// we can use "readFileSync" in this case, because it is executed only once during program startup
export default process.env.NODE_ENV === 'production'
    ? new pg.Pool({
          ssl: {
              ca: readFileSync(
                  join(process.cwd(), 'src', 'config', 'eu-north-1-bundle.pem')
              ).toString(),
              requestCert: true,
              rejectUnauthorized: true,
          },
      })
    : new pg.Pool();
