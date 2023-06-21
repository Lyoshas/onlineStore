import { createContext } from 'react';
import * as Yup from 'yup';

const SchemaContext = createContext<Yup.ObjectSchema<any>>(Yup.object());

export default SchemaContext;
