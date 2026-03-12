import React from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import Simulator from './pages/Simulator';

function App() {
  return (
    <LanguageProvider>
      <Simulator />
    </LanguageProvider>
  );
}

export default App;
