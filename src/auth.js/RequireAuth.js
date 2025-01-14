import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';

const RequireAuth = ({ allowedRoles }) => {
  const { roles } = useAuth();
   console.log('useAuth', useAuth());
  if (!roles) {
    return <Navigate to="/login" replace />;
  }
  

  const isAuthorized = roles.some(role => allowedRoles.includes(role));
  console.log('Is Authorized:', isAuthorized);
  console.log('allowedRoles' , allowedRoles);
  console.log('roles', roles);

  return isAuthorized ? <Outlet /> : <Navigate to="/not-authorized" replace />;
};

export default RequireAuth;
