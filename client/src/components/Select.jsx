import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiCheck, FiPlus } from 'react-icons/fi';

export default function Select({ value, onChange, options = [], placeholder = 'Select…', iconMap, disabledOptions = [], className = '', allowCustom = false, customLabel = 'Other' }) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [pos, setPos] = useState({ left: 0, width: 0, top: 0, up: false, ready: false });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const measure = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const panel = panelRef.current;
    let up = false;
    let top = rect.bottom + 8;
    if (panel) {
      const panelHeight = panel.offsetHeight;
      up = panelHeight + 12 > window.innerHeight - rect.bottom;
      top = up ? Math.max(8, rect.top - panelHeight - 8) : rect.bottom + 8;
    }
    setPos({ left: rect.left, width: rect.width, top, up, ready: true });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open, customMode]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, customMode]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target) && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setCustomMode(false);
        setCustomValue('');
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (customMode) {
          setCustomMode(false);
          setCustomValue('');
        } else {
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [customMode]);

  useEffect(() => {
    if (open && customMode && inputRef.current) inputRef.current.focus();
  }, [open, customMode]);

  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = value ? items.find((o) => o.value === value) : undefined;
  const isCustomSelected = value && !selected;
  const SelIcon = selected && iconMap && iconMap[selected.value] ? iconMap[selected.value].icon : null;
  const SelMeta = selected && iconMap && iconMap[selected.value] ? iconMap[selected.value] : null;

  const confirmCustom = () => {
    const v = customValue.trim();
    if (!v) return;
    onChange(v);
    setCustomMode(false);
    setCustomValue('');
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={buttonRef}>
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
          <span className={`truncate ${selected || isCustomSelected ? 'text-gray-700 dark:text-navy-200' : 'text-gray-400 dark:text-navy-500'}`}>
            {selected ? selected.label : isCustomSelected ? value : placeholder}
          </span>
        </span>
        <FiChevronDown size={16} className={`text-gray-400 dark:text-navy-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width, visibility: pos.ready ? 'visible' : 'hidden', zIndex: 1000 }}
        >
          <div className={`card p-1.5 shadow-elevated max-h-72 overflow-y-auto ${pos.up ? 'animate-fade-up origin-bottom' : 'animate-fade-down origin-top'}`}>
            {customMode ? (
              <div className="flex items-center gap-2 p-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmCustom();
                    if (e.key === 'Escape') { setCustomMode(false); setCustomValue(''); }
                  }}
                  placeholder={`Type custom ${customLabel.toLowerCase()}…`}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-600 text-sm text-gray-700 dark:text-navy-200 placeholder-gray-400 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-700"
                />
                <button
                  type="button"
                  onClick={confirmCustom}
                  disabled={!customValue.trim()}
                  aria-label="Confirm custom value"
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-primary-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary-700"
                >
                  <FiCheck size={16} />
                </button>
              </div>
            ) : (
              <>
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
                {allowCustom && (
                  <>
                    {items.length > 0 && <div className="my-1.5 h-px bg-gray-100 dark:bg-navy-700" />}
                    <button
                      type="button"
                      onClick={() => { setCustomValue(''); setCustomMode(true); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-sm text-left transition-all duration-200 ${isCustomSelected ? 'bg-primary-50 dark:bg-navy-700 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800'}`}
                    >
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center mr-2 shrink-0 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                        <FiPlus size={13} />
                      </span>
                      <span className="truncate">{customLabel}</span>
                      {isCustomSelected && <FiCheck size={15} className="ml-auto text-primary-500 shrink-0" />}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
