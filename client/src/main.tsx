import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';

import './index.css';
import store from './store/index';
import apolloClient from './graphql/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <ApolloProvider client={apolloClient}>
                    <App />
                </ApolloProvider>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
);
