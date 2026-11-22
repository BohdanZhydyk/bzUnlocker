import React from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { UnlockTab } from './components/UnlockTab';
import { SettingsTab } from './components/SettingsTab';
import { AboutTab } from './components/AboutTab';
import { translations, skippedWarnings } from './translates';
import './style.scss';

function App() {
  const [lang, setLang] = React.useState(() => {
    try {
      return localStorage.getItem('bzUnlocker-language') || 'PL';
    } catch {
      return 'PL';
    }
  });
  const t = translations[lang] || translations.PL;

  const [tab, setTab] = React.useState('unlock');
  const [target, setTarget] = React.useState('');
  const [processes, setProcesses] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [scanned, setScanned] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [confirmUnlock, setConfirmUnlock] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState(false);
  const [context, setContext] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(true);

  const scanRef = React.useRef(null);

  const errorText = e =>
    String(e?.message || e || 'Nieznany błąd.')
      .replace(/^Error invoking remote method '[^']+':\s*(?:Error:\s*)?/i, '')
      .replace(/^Error:\s*/i, '');

  const message = (s, isError = false) => {
    setStatus(s);
    setError(isError);
  };

  const resetConfirmations = () => {
    setProcesses([]);
    setSelected([]);
    setScanned(false);
    setConfirmRemove(false);
    setConfirmUnlock(false);
  };

  React.useEffect(() => {
    scanRef.current = scan;
  });

  React.useEffect(() => {
    window.unlocker
      .initialPath()
      .then(p => {
        if (p) {
          setTarget(p);
          scanRef.current?.(p);
        }
      })
      .catch(e => {
        message(errorText(e), true);
      });

    window.unlocker.contextStatus().then(setContext).catch(() => {});
    window.unlocker.isAdmin().then(setIsAdmin).catch(() => {});
  }, []);

  function updateLanguage(next) {
    setLang(next);
    try {
      localStorage.setItem('bzUnlocker-language', next);
    } catch {}
  }

  async function choose(type) {
    try {
      const p = await window.unlocker.choose(type);
      if (p) {
        setTarget(p);
        resetConfirmations();
        message('');
        await scan(p);
      }
    } catch (e) {
      message(errorText(e), true);
    }
  }

  async function scan(p = target, wasUnlock = false) {
    if (!p) return message(t.chooseFirst, true);
    setBusy(true);
    setScanned(false);
    try {
      const r = await window.unlocker.scan(p);
      const list = r.processes || [];
      setProcesses(list);
      setSelected(list.map(x => x.pid));
      setScanned(true);

      if (wasUnlock) {
        if (list.length === 0) {
          message(t.unlockedSuccess);
        } else {
          message(`${t.closedAll} ${t.rescan}`, true);
        }
      } else {
        message(
          [
            r.truncated ? t.truncated : '',
            r.skipped ? skippedWarnings[lang] : ''
          ]
            .filter(Boolean)
            .join(' ')
        );
      }
    } catch (e) {
      message(errorText(e), true);
      setProcesses([]);
      setSelected([]);
      setScanned(false);
    } finally {
      setBusy(false);
    }
  }

  async function unlock() {
    if (!selected.length) {
      setConfirmUnlock(false);
      return message(t.select, true);
    }
    setBusy(true);
    const failed = [];
    for (const pid of selected) {
      try {
        await window.unlocker.kill(pid);
      } catch (e) {
        failed.push(`${pid}: ${errorText(e)}`);
      }
    }
    setConfirmUnlock(false);

    if (failed.length) {
      message(`${t.failed} ${failed.join('; ')}`, true);
      // Auto-rescan to reflect state
      await scan(target, false);
    } else {
      // Auto-rescan to confirm complete unlock
      await scan(target, true);
    }
  }

  async function remove() {
    if (!target) return message(t.chooseFirst, true);
    setBusy(true);
    try {
      const done = await window.unlocker.remove(target);
      if (done) {
        message(t.removed);
        setTarget('');
        resetConfirmations();
      }
    } catch (e) {
      message(errorText(e), true);
    } finally {
      setBusy(false);
    }
  }

  async function toggleContext() {
    try {
      const next = !context;
      await window.unlocker.context(next);
      setContext(next);
      message(next ? t.added : t.deleted);
    } catch (e) {
      message(errorText(e), true);
    }
  }

  return (
    <div className="app">
      <Header
        tab={tab}
        setTab={setTab}
        onTabChange={() => message('')}
        t={t}
        isAdmin={isAdmin}
        onElevate={() => window.unlocker.elevate()}
      />

      <div className="body">
        <main>
          {tab === 'unlock' && (
            <UnlockTab
              target={target}
              setTarget={setTarget}
              processes={processes}
              selected={selected}
              setSelected={setSelected}
              scanned={scanned}
              busy={busy}
              status={status}
              error={error}
              confirmRemove={confirmRemove}
              setConfirmRemove={setConfirmRemove}
              confirmUnlock={confirmUnlock}
              setConfirmUnlock={setConfirmUnlock}
              lang={lang}
              t={t}
              onChoose={choose}
              onScan={() => scan(target)}
              onUnlock={unlock}
              onRemove={remove}
              resetConfirmations={resetConfirmations}
            />
          )}

          {tab === 'settings' && (
            <SettingsTab
              context={context}
              toggleContext={toggleContext}
              lang={lang}
              updateLanguage={updateLanguage}
              t={t}
              status={status}
              error={error}
            />
          )}

          {tab === 'about' && <AboutTab t={t} />}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
