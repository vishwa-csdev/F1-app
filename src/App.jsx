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
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <TabBar activeTab={tab} onTabChange={handleTabChange} />
    </div>
  );
}
