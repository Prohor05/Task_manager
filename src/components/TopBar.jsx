import React from 'react';

export default function TopBar({ t, lang, onLang, search, onSearch, filter, onFilter, weekOffset, onWeek, onInvite }) {
  return (
    <header className="h-16 shrink-0 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center gap-3 px-5">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={t('search')}
        className="flex-1 max-w-md text-sm px-3 py-2 rounded-xl bg-canvas outline-none focus:ring-2 focus:ring-accent/30"
      />
      <select
        value={filter}
        onChange={(e) => onFilter(e.target.value)}
        className="text-sm px-3 py-2 rounded-xl bg-canvas outline-none"
      >
        <option value="all">{t('filters')}</option>
        <option value="todo">{t('todo')}</option>
        <option value="doing">{t('doing')}</option>
        <option value="done">{t('done')}</option>
      </select>
      <div className="flex items-center gap-1 ml-auto">
        <button className="btn-glow px-2 py-1 rounded-lg text-sm" onClick={() => onWeek(weekOffset - 1)}>
          ‹
        </button>
        <span className="text-sm text-muted w-24 text-center">{weekOffset === 0 ? t('today') : t('week')}</span>
        <button className="btn-glow px-2 py-1 rounded-lg text-sm" onClick={() => onWeek(weekOffset + 1)}>
          ›
        </button>
      </div>
      <button
        onClick={() => onLang(lang === 'en' ? 'ru' : 'en')}
        className="btn-glow text-sm px-3 py-2 rounded-xl bg-canvas"
      >
        {lang === 'en' ? 'EN' : 'RU'}
      </button>
      <button onClick={onInvite} className="btn-glow text-sm px-3 py-2 rounded-xl bg-accentSoft text-accent font-medium">
        {t('invite')}
      </button>
    </header>
  );
}
