import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';

import SignUp from './pages/SignUp/SignUp';
import './App.css';
import ActivateAccount from './pages/ActivateAccount/ActivateAccount';

const App: FC = () => {
    return (
        <Routes>
            <Route path="/sign-up" element={<SignUp />} />
            <Route
                path="/auth/activate-account/:activationToken"
                element={<ActivateAccount />}
            />
        </Routes>
    );
};

export default App;
