import React from 'react';
import { ExternalLink, Globe, Cpu, User, Info, CheckCircle2 } from 'lucide-react';

export function AboutTab({ t }) {
  const handleOpenWebsite = e => {
    e.preventDefault();
    if (window.unlocker?.openExternal) {
      window.unlocker.openExternal('https://bzdrive.com');
    } else {
      window.open('https://bzdrive.com', '_blank');
    }
  };

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>bzUnlocker</h1>
        <span className="about-version-badge">v0.1.0</span>
      </div>

      <div className="about-info-box">
        <div className="about-info-icon">
          <Info size={28} />
        </div>
        <div className="about-info-content">
          <p className="about-info-text">{t.aboutDesc}</p>
          {t.aboutFeatures && (
            <ul className="about-features-list">
              {t.aboutFeatures.map((f, i) => (
                <li key={i}>
                  <CheckCircle2 size={16} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="about-card">
        <div className="about-row">
          <span className="about-label">
            <User size={16} /> {t.author}
          </span>
          <span className="about-value">
            <strong>bzDrive</strong> (Bohdan Zhydyk)
          </span>
        </div>

        <div className="about-row">
          <span className="about-label">
            <Globe size={16} /> {t.website}
          </span>
          <a
            href="https://bzdrive.com"
            onClick={handleOpenWebsite}
            className="about-link"
            title="https://bzdrive.com"
          >
            <span>bzdrive.com</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="about-row">
          <span className="about-label">
            <Cpu size={16} /> Technologia
          </span>
          <span className="about-value">
            Windows Restart Manager API + Electron + React
          </span>
        </div>
      </div>
    </div>
  );
}
