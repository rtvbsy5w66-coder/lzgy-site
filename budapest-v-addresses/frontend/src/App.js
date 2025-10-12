import React from 'react';
import AddressSearch from './components/AddressSearch';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <AddressSearch />
    </div>
  );
}

export default App;