import { useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { authState } = useContext(AuthContext);
  const { isAuthenticated } = authState;
  console.log("PrivateRoute:", { isAuthenticated });

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
