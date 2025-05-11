// src/app/routs/Providers.tsx

import React from "react";
import { Provider } from "react-redux";
import store from "../../store";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
        {children}
    </Provider>
  );
};

export default AppProviders;
