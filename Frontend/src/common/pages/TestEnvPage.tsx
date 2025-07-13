// src/pages/TestEnvPage.tsx

import React from 'react';

const TestEnvPage: React.FC = () => {
  return (
    <div>
      <h2>Environment Variable Test Page</h2>
      <p><strong>REACT_APP_SERVER_URL:</strong> {process.env.REACT_APP_SERVER_URL}</p>
    </div>
  );
};

export default TestEnvPage;
