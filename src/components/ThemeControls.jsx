export function ThemeControls({ theme, onUpdate }) {
  const accentColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Slate', value: '#475569' },
  ];

  const fonts = [
    { name: 'Sans Serif', value: 'sans' },
    { name: 'Serif', value: 'serif' },
    { name: 'Modern', value: 'modern' },
  ];

  const densities = [
    { name: 'Comfortable', value: 'comfortable' },
    { name: 'Compact', value: 'compact' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Theme & Appearance</h3>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Accent Color</label>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => onUpdate({ accentColor: color.value })}
              className={`w-10 h-10 rounded-full border-2 transition ${
                theme.accentColor === color.value
                  ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-900'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Font Style</label>
        <div className="grid grid-cols-3 gap-3">
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onUpdate({ font: font.value })}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition ${
                theme.font === font.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
              style={{
                fontFamily:
                  font.value === 'serif'
                    ? 'Georgia, serif'
                    : font.value === 'modern'
                    ? 'Helvetica, Arial, sans-serif'
                    : 'Segoe UI, Arial, sans-serif',
              }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Spacing Density</label>
        <div className="grid grid-cols-2 gap-3">
          {densities.map((density) => (
            <button
              key={density.value}
              onClick={() => onUpdate({ density: density.value })}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition ${
                theme.density === density.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              {density.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
