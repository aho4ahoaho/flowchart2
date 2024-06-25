import React from 'react';
import { createRoot } from 'react-dom/client';
import { Main } from './app/main';
import "./index.css";

const container = document.querySelector('#root');
if (container != null) {
    const root = createRoot(container);

    root.render(<Main />);
}
