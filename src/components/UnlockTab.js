import React from 'react';
import {
  FolderOpen,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { chooserLabels, removeLabels } from '../translates';

export function UnlockTab({
  target,
  setTarget,
  processes,
  selected,
  setSelected,
  scanned,
  busy,
  status,
  error,
  confirmRemove,
  setConfirmRemove,
  confirmUnlock,
  setConfirmUnlock,
  lang,
  t,
  onChoose,
  onScan,
  onUnlock,
  onRemove,
  resetConfirmations
}) {
  const allSelected = processes.length > 0 && selected.length === processes.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(processes.map(p => p.pid));
    }
  }

  return (
    <>
      <label>{t.subtitle}</label>
      <div className="file-input">
        <FolderOpen color="#e8bb44" />
        <input
          value={target}
          onChange={e => {
            setTarget(e.target.value);
            resetConfirmations();
          }}
          placeholder={t.placeholder}
        />
        <div className="choose-group">
          <button className="choose-button" onClick={() => onChoose('folder')}>
            <FolderOpen size={18} /> {chooserLabels[lang].folder}
          </button>
          <button className="choose-button" onClick={() => onChoose('file')}>
            {chooserLabels[lang].file}
          </button>
        </div>
        <button className="scan-button" onClick={() => onScan()} disabled={busy}>
          <Search size={20} /> {busy ? t.busy : t.scan}
        </button>
      </div>

      {status && (
        <div className="scan-feedback">
          <div className={`scan-status ${error ? 'error' : ''}`}>
            {error ? <XCircle /> : <CheckCircle2 />}
            <span>{status}</span>
          </div>
        </div>
      )}

      <section className="process-panel">
        <div className="process-heading">
          <h2>{t.processes}</h2>
          {scanned && <span>{t.scanned} {processes.length}.</span>}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  {processes.length > 0 && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      title={t.selectAll}
                    />
                  )}
                </th>
                <th>{t.process}</th>
                <th>PID</th>
                <th>{t.exe}</th>
              </tr>
            </thead>
            <tbody>
              {processes.length ? (
                processes.map(p => (
                  <tr key={p.pid}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.pid)}
                        onChange={e =>
                          setSelected(old =>
                            e.target.checked
                              ? [...old, p.pid]
                              : old.filter(x => x !== p.pid)
                          )
                        }
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.pid}</td>
                    <td title={p.exe}>{p.exe || t.noAccess}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty">
                    {t.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="actions">
        {confirmRemove ? (
          <>
            <span className="confirm-message">
              <AlertTriangle size={16} color="#fbbf24" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              {removeLabels[lang].removePrompt}
            </span>
            <button
              className="confirm-button confirm-icon-button"
              onClick={onRemove}
              disabled={busy}
              title={removeLabels[lang].confirm}
              aria-label={removeLabels[lang].confirm}
            >
              <Check />
            </button>
            <button
              className="danger confirm-icon-button"
              onClick={() => setConfirmRemove(false)}
              disabled={busy}
              title={removeLabels[lang].cancel}
              aria-label={removeLabels[lang].cancel}
            >
              <X />
            </button>
          </>
        ) : confirmUnlock ? (
          <>
            <span className="confirm-message">
              <AlertTriangle size={16} color="#fbbf24" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              {removeLabels[lang].unlockPrompt} {t.warning}
            </span>
            <button
              className="confirm-button confirm-icon-button"
              onClick={onUnlock}
              disabled={busy}
              title={t.unlock}
              aria-label={t.unlock}
            >
              <Check />
            </button>
            <button
              className="danger confirm-icon-button"
              onClick={() => setConfirmUnlock(false)}
              disabled={busy}
              title={removeLabels[lang].cancel}
              aria-label={removeLabels[lang].cancel}
            >
              <X />
            </button>
          </>
        ) : (
          <>
            <button
              className="unlock-button"
              onClick={() => {
                setConfirmUnlock(true);
                setConfirmRemove(false);
              }}
              disabled={busy || !selected.length}
            >
              <Unlock /> {t.unlock}
            </button>
            <button
              className="danger"
              onClick={() => {
                setConfirmRemove(true);
                setConfirmUnlock(false);
              }}
              disabled={busy || !target}
            >
              <Trash2 /> {t.remove}
            </button>
          </>
        )}
      </div>
    </>
  );
}
