import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import './App.css';

import Register from './components/outsider/Register';
import Main from './components/admin/Main';

import ProtectRoute from './components/outsider/Protection';
import UserMain from './components/user/Main';

import GetUser from './utils/GetUser';

function RedirectUser() {
  const [path, setPath] = React.useState(null);

  React.useEffect(() => {
    async function Check() {
      const user = await GetUser();
     // console.log("RedirectUser got:", user);

      if (!user)
        setPath('/login');
      else if (user.role >= 2)
        setPath('/admin/dashboard');
      else
        setPath('/landing');
    }

    Check();
  }, []);

  if (path === null) 
    setPath('/login');

  return <Navigate to={path} replace />
}

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<RedirectUser/>}></Route>
          <Route path='/*' element={
            <ProtectRoute role_id={0}>
              <UserMain />
            </ProtectRoute>
          } />
          <Route path='/admin/*' element={
            <ProtectRoute role_id={2}>
              <Main />
            </ProtectRoute>
          } />
          <Route path='/admin' element={
            <ProtectRoute role_id={2}>
              <Main />
            </ProtectRoute>
          } />
          <Route path='/login' element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
