import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks/hooks";
import { loginSuccess } from "./authSlice";
import { setTokens } from "../../utils/tokenManager";
import { fetchUserDetails, loginUser } from "./authSlice";
import { toast } from "sonner";
import { useFormState } from "@/store/hooks/useFormState";

export const useLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError, loading, setLoading } = useFormState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) log in and persist tokens
      const { access, refresh } = await dispatch(
        loginUser({ username, password })
      ).unwrap();

      setTokens(access, refresh, username);

      // 2) now fetch the actual user object from /auth/me/
      const user = await dispatch(fetchUserDetails()).unwrap();

      // 3) update your Redux state in one go
      dispatch(loginSuccess({ token: access, user }));

      // 4) show toast & redirect
      toast.success(`Welcome back, ${user.username}!`);
      navigate("/marketplace");
    } catch (err) {
      setError(typeof err === "string" ? err : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    password,
    error,
    loading,
    setUsername,
    setPassword,
    handleSubmit,
  };
};
