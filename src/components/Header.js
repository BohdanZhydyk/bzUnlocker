import React from 'react';
import { Unlock, Settings, Info, ShieldCheck, ShieldAlert } from 'lucide-react';

export function Header({ tab, setTab, onTabChange, t, isAdmin, onElevate }) {
  return (
    <header>
      <img className="app-icon" src="./icon.png" alt="" />
      <div className="brand">
        <strong>bzUnlocker</strong>
        <span
          className={`admin-badge ${isAdmin ? 'admin-yes' : 'admin-no'}`}
          title={isAdmin ? t.admin : t.elevatePrompt}
          onClick={!isAdmin ? onElevate : undefined}
        >
          {isAdmin ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
          <span>{isAdmin ? t.admin : t.noAdmin}</span>
        </span>
      </div>
      <nav>
        <button
          className={tab === 'unlock' ? 'active' : ''}
          onClick={() => {
            setTab('unlock');
            onTabChange();
          }}
        >
          <Unlock /> {t.unlock}
        </button>
        <button
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => {
            setTab('settings');
            onTabChange();
          }}
        >
          <Settings /> {t.settings}
        </button>
        <button
          className={tab === 'about' ? 'active' : ''}
          onClick={() => {
            setTab('about');
            onTabChange();
          }}
        >
          <Info /> {t.about}
        </button>
      </nav>
    </header>
  );
}
