'use client';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import NewRequest from './components/NewRequest';
import Status from './components/Status';
import Activity from './components/Activity';
import Profile from './components/Profile';

const tabs = [
  { id: 'home', label: 'Home', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg> },
  { id: 'activity', label: 'Activity', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState<any>({});

  useEffect(() => {
    const d = localStorage.getItem('fixam_auth');
    if (d) { const p = JSON.parse(d); setToken(p.token); setUser(p.user); }
  }, []);

  const login = (t: string, u: any) => { setToken(t); setUser(u); localStorage.setItem('fixam_auth', JSON.stringify({ token: t, user: u })); };
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('fixam_auth'); setScreen('home'); };
  const nav = (s: string, p?: any) => { setScreen(s); if (p) setParams(p); window.scrollTo(0, 0); };

  // Guest guard — redirect to login for screens that need auth
  const needsAuth = ['activity', 'profile', 'status'].includes(screen);
  if (needsAuth && !token) {
    return <Login onLogin={(t, u) => { login(t, u); /* stay on intended screen */ }} />;
  }

  const isDetail = ['new', 'status'].includes(screen);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gray-50/50 relative">
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 80 }}>
        {screen === 'home' && <Home nav={nav} token={token} user={user} />}
        {screen === 'new' && <NewRequest nav={nav} token={token} user={user} params={params} onNeedAuth={login} />}
        {screen === 'status' && <Status nav={nav} token={token!} params={params} />}
        {screen === 'activity' && <Activity nav={nav} token={token!} />}
        {screen === 'profile' && <Profile user={user} logout={logout} />}
      </div>

      {isDetail && (
        <button onClick={() => nav('home')} className="absolute top-4 left-4 z-10 w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 safe-bottom" style={{ zIndex: 50 }}>
        <div className="flex">
          {tabs.map(t => {
            const active = screen === t.id || (t.id === 'home' && isDetail);
            return (
              <button key={t.id} onClick={() => nav(t.id)}
                className={`flex-1 flex flex-col items-center pt-2 pb-1 transition ${active ? 'text-teal-600' : 'text-gray-300'}`}>
                {active && <span className="w-4 h-0.5 bg-teal-600 rounded-full mb-1" />}
                {!active && <span className="w-4 h-0.5 mb-1" />}
                {t.icon}
                <span className="text-[10px] font-medium mt-0.5">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
