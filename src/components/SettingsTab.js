import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { FlagPL, FlagEN, FlagUA } from './Flags';

export function SettingsTab({ context, toggleContext, lang, updateLanguage, t, status, error }) {
  return (
    <>
      <h1>{t.settings}</h1>
      <section className="context">
        <div className="context-icon">
          <MousePointer2 />
        </div>
        <div>
          <strong>{t.context}</strong>
          <p>{t.contextDesc}</p>
        </div>
        <label className="switch">
          <input type="checkbox" checked={context} onChange={toggleContext} />
          <span />
        </label>
      </section>

      <section className="language-setting">
        <div>
          <strong>{t.language}</strong>
          <p>{t.languageDesc}</p>
        </div>
        <div className="language-flags">
          <button
            className={lang === 'PL' ? 'active' : ''}
            onClick={() => updateLanguage('PL')}
            title="Polski"
            aria-label="Polski"
            aria-pressed={lang === 'PL'}
          >
            <span className="flag">
              <FlagPL />
            </span>
          </button>
          <button
            className={lang === 'EN' ? 'active' : ''}
            onClick={() => updateLanguage('EN')}
            title="English"
            aria-label="English"
            aria-pressed={lang === 'EN'}
          >
            <span className="flag">
              <FlagEN />
            </span>
          </button>
          <button
            className={lang === 'UA' ? 'active' : ''}
            onClick={() => updateLanguage('UA')}
            title="Українська"
            aria-label="Українська"
            aria-pressed={lang === 'UA'}
          >
            <span className="flag">
              <FlagUA />
            </span>
          </button>
        </div>
      </section>

      {status && <div className={`status ${error ? 'error' : ''}`}>{status}</div>}
    </>
  );
}
