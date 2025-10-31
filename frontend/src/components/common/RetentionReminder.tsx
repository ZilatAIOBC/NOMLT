import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

type RetentionReminderProps = {
  title?: string;
  message?: string;
  className?: string;
  dismissible?: boolean; // if true, show dismiss controls
  suppressForDays?: number; // persist dismissal for N days (only if dismissible)
  storageKey?: string; // override localStorage key if needed (only if dismissible)
  onDismiss?: () => void; // callback when dismissed
};

const RetentionReminder: React.FC<RetentionReminderProps> = ({
  title = 'Reminder',
  message = 'Your outputs are stored for 7 days only. Please download and save them before they expire.',
  className = '',
  dismissible = false,
  suppressForDays = 7,
  storageKey = 'retentionReminderDismissedUntil',
  onDismiss
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (!dismissible) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const until = parseInt(raw, 10);
      if (!Number.isNaN(until) && Date.now() < until) {
        setIsVisible(false);
      }
    } catch {
      // ignore storage access issues
    }
  }, [dismissible, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      try {
        const until = Date.now() + suppressForDays * 24 * 60 * 60 * 1000;
        localStorage.setItem(storageKey, String(until));
      } catch {
        // ignore storage access issues
      }
    }
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Retention reminder"
      className={`relative rounded-xl border border-yellow-400/30 bg-[linear-gradient(180deg,rgba(253,224,71,0.10)_0%,rgba(0,0,0,0.10)_100%)] text-yellow-100 ring-1 ring-yellow-400/10 backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 md:p-5">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 flex-shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm md:text-base leading-relaxed">
            <div className="font-semibold text-yellow-100">{title}</div>
            <div className="text-yellow-100/90">{message}</div>
          </div>
        </div>
        {dismissible && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDismiss}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-md bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-100 text-xs md:text-sm transition-colors"
            >
              Dismiss for {suppressForDays} days
            </button>
            <button
              type="button"
              aria-label="Dismiss reminder"
              onClick={handleDismiss}
              className="inline-flex sm:hidden p-2 rounded-md bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetentionReminder;


