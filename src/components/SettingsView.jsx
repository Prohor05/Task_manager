import React from 'react';
import { api } from '../api';

export default function SettingsView({ t, lang, onLang }) {
  return (
    <div className="spring-view max-w-xl bg-white rounded-2xl shadow-card p-6 space-y-5">
      <h2 className="text-lg font-semibold">{t('settings')}</h2>
      <div>
        <div className="text-sm mb-2">{t('language')}</div>
        <div className="flex gap-2">
          <button
            className={`btn-glow px-4 py-2 rounded-xl text-sm ${lang === 'en' ? 'bg-accent text-white' : 'bg-canvas'}`}
            onClick={() => onLang('en')}
          >
            {t('english')}
          </button>
          <button
            className={`btn-glow px-4 py-2 rounded-xl text-sm ${lang === 'ru' ? 'bg-accent text-white' : 'bg-canvas'}`}
            onClick={() => onLang('ru')}
          >
            {t('russian')}
          </button>
        </div>
      </div>
      <div>
        <div className="text-sm mb-2">{t('reminder')}</div>
        <p className="text-xs text-muted mb-2">1h / 24h / 48h — {t('hoursBefore')}</p>
        <button className="btn-glow px-4 py-2 rounded-xl text-sm bg-canvas" onClick={() => api.notify('Deadline reminder')}>
          {t('testNotify')}
        </button>
      </div>
    </div>
  );
}
