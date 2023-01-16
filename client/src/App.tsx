import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';

import SignUp from './pages/SignUp';
import './App.css';

const App: FC = () => {
    return (
        <Routes>
            <Route path="/sign-up" element={<SignUp />} />
        </Routes>
    );
};

export default App;
