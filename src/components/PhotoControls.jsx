// Shared photo customization controls (show / shape / position / size).
// Used both in the Personal Info form (under the uploader) and in the
// preview's Arrange panel, so the two stay in sync.
export function PhotoControls({ theme = {}, updateTheme, hasPhoto }) {
  if (!hasPhoto) return null;
  const showing = theme.showPhoto !== false;
  const groups = [
    { key: 'photoShape', label: 'Shape', def: 'circle', opts: [['circle', 'Circle'], ['rounded', 'Rounded'], ['square', 'Square']] },
    { key: 'photoAlign', label: 'Position', def: 'left', opts: [['left', 'Left'], ['center', 'Center'], ['right', 'Right']] },
  ];

  return (
    <div className="space-y-2.5 pt-0.5">
      <label className="flex items-center gap-2 text-xs text-slate-600 select-none">
        <input
          type="checkbox"
          checked={showing}
          onChange={(e) => updateTheme({ showPhoto: e.target.checked })}
          className="rounded border-slate-300"
        />
        Show photo on resume
      </label>

      {showing && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {groups.map((group) => (
              <div key={group.key} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">{group.label}</span>
                <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                  {group.opts.map(([val, lbl]) => {
                    const active = (theme[group.key] || group.def) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateTheme({ [group.key]: val })}
                        className={`px-2.5 py-1 text-xs font-medium transition ${
                          active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 max-w-xs">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Size</span>
            <input
              type="range"
              min={48}
              max={140}
              step={4}
              value={theme.photoSize || 80}
              onChange={(e) => updateTheme({ photoSize: Number(e.target.value) })}
              className="flex-1 accent-blue-600"
            />
            <span className="text-xs text-slate-500 tabular-nums w-10 text-right">{theme.photoSize || 80}px</span>
          </div>
        </>
      )}
    </div>
  );
}
