import { Outlet } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { RequireAuth } from '../../features/auth/RequireAuth';

export function PrivateLayout() {
  return (
    <RequireAuth>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

export default PrivateLayout;
