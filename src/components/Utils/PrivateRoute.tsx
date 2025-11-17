import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid } from "../../utils/TokenVerify";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  //   const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = localStorage.getItem('accessToken');
  const location = useLocation();
  const validtoken = isTokenValid(token);
  
  if (!token || !validtoken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
