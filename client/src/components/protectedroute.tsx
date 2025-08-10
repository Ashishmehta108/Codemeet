import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    const getuser = async () => {
      await fetchUser();
    };
    console.log(user);
    getuser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
