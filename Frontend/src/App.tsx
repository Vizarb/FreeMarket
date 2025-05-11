import React, { useEffect } from "react";
import { restoreAuth } from "./features/auth/authSlice";  // ✅ Import `restoreAuth`
import AppRoutes from "./app/routes/AppRoutes";
import { useAppDispatch } from "./store/hooks/hooks";

const App: React.FC = () => {
  const dispatch = useAppDispatch();

useEffect(() => {
  const runRestore = async () => {
    try {
      await restoreAuth(dispatch);
    } catch (err) {
      console.error("Auth restoration failed:", err);
    }
  };
  runRestore();
}, [dispatch]);


  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
};

export default App;
