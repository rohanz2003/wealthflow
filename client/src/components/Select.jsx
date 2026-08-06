import { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export default function Select({ value, onChange, options = [], placeholder = 'Select…', iconMap, disabledOptions = [], className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = value ? items.find((o) => o.value === value) : undefined;
  const SelIcon = selected && iconMap && iconMap[selected.value] ? iconMap[selected.value].icon : null;
  const SelMeta = selected && iconMap && iconMap[selected.value] ? iconMap[selected.value] : null;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 text-sm text-left transition-all duration-200 hover:border-primary-400 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-700"
      >
        <span className="flex items-center min-w-0">
          {SelIcon && SelMeta && (
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 shrink-0 ${SelMeta.bg} ${SelMeta.text}`}>
              <SelIcon size={13} />
            </span>
          )}
          <span className={`truncate ${selected ? 'text-gray-700 dark:text-navy-200' : 'text-gray-400 dark:text-navy-500'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <FiChevronDown size={16} className={`text-gray-400 dark:text-navy-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto card p-1.5 shadow-elevated animate-fade-down origin-top">
          {items.map((o) => {
            const meta = iconMap && iconMap[o.value] ? iconMap[o.value] : null;
            const Icon = meta ? meta.icon : null;
            const isDisabled = disabledOptions.includes(o.value);
            const isSel = o.value === value;
            return (
              <button
                type="button"
                key={o.value}
                disabled={isDisabled}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-xl text-sm text-left transition-all duration-200 ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed'
                    : isSel
                      ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                }`}
              >
                {Icon && meta && (
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 shrink-0 ${meta.bg} ${meta.text}`}>
                    <Icon size={13} />
                  </span>
                )}
                <span className="truncate">{o.label}</span>
                {isSel && <FiCheck size={15} className="ml-auto text-primary-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
