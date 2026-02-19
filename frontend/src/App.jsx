import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicView from './views/Public';
import AdminView from './views/Admin';
import ScreenView from './views/Screen';

function App() {
    return (
        <div className="app-container">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<PublicView />} />
                    <Route path="/admin" element={<AdminView />} />
                    <Route path="/screen" element={<ScreenView />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;