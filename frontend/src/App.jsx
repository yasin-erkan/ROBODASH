import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import {useAuth} from './hooks/useAuth';

export default function App() {
  const {isLoggedIn, login, logout, user, token} = useAuth();

  if (!isLoggedIn) {
    return <LoginPage onLogin={login} />;
  }

  return <Dashboard user={user} token={token} onLogout={logout} />;
}
