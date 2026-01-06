import { Outlet } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';

export function PublicLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default PublicLayout;
