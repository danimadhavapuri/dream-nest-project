import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Route protection wrapper
 * Redirects unauthenticated visitors to /login, remembering their target page
 */
const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
