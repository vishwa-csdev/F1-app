import { useState } from 'react';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import Race from './pages/Race';
import Drivers from './pages/Drivers';
import DriverDetail from './pages/DriverDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';

export default function App() {
  const [tab, setTab] = useState('home');
  const [selDriver, setSelDriver] = useState(null);
  const [selTeam, setSelTeam] = useState(null);

  function handleTabChange(newTab) {
    setTab(newTab);
    setSelDriver(null);
    setSelTeam(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Dynamic header title
  const getHeaderTitle = () => {
    if (tab === 'home') return 'F1 Hub';
    if (tab === 'race') return 'Race Center';
    if (tab === 'drivers') {
      return selDriver ? selDriver.driver_name : 'Driver Standings';
    }
    if (tab === 'teams') {
      return selTeam ? selTeam.team_name : 'Constructor Standings';
    }
    return 'F1 Hub';
  };

  return (
    <div className="app-shell">
      {/* App Header */}
      <header className="app-header">
        <div className="app-logo">🏎️</div>
        <h1 className="app-title">{getHeaderTitle()}</h1>
        <div className="app-season">{new Date().getFullYear()}</div>
      </header>

      {/* Main Screen Content */}
      <main className="app-content">
        {tab === 'home' && <Home onNav={handleTabChange} />}
        {tab === 'race' && <Race />}
        {tab === 'drivers' && (
          selDriver ? (
            <DriverDetail driver={selDriver} onBack={() => setSelDriver(null)} />
          ) : (
            <Drivers onSelect={setSelDriver} />
          )
        )}
        {tab === 'teams' && (
          selTeam ? (
            <TeamDetail team={selTeam} onBack={() => setSelTeam(null)} />
          ) : (
            <Teams onSelect={setSelTeam} />
          )
        )}

        {/* Clean Footer with GitHub Link & Disclaimer */}
        <footer className="app-footer">
          <a
            href="https://github.com/vishwa-csdev/F1-app"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor"/>
            </svg>
            <span>vishwa-csdev/F1-app</span>
          </a>
          <p className="footer-disclaimer">
            This is an independent, open-source project and is not associated in any way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX, and related marks are trade marks of Formula One Licensing B.V.
          </p>
        </footer>
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <TabBar activeTab={tab} onTabChange={handleTabChange} />
    </div>
  );
}
