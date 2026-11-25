import { useEffect, useState } from 'react';
import App from './App';
import { AdminPage } from './components/AdminPage';

const isAdminPath = () =>
  window.location.pathname.replace(/\/+$/, '') === '/admin' || window.location.hash.startsWith('#/admin');

/** /admin (یان /#/admin) = پەڕەی ئەدمین، هەموو شتێکی تر = سایتی ئاسایی */
export default function Root() {
  const [admin, setAdmin] = useState(isAdminPath());
  useEffect(() => {
    const on = () => setAdmin(isAdminPath());
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
    };
  }, []);
  return admin ? <AdminPage /> : <App />;
}
