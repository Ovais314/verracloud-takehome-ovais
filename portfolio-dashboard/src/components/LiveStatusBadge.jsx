const LABELS = {
  connecting: { text: 'Connecting…', className: 'live-badge--pending' },
  connected: { text: 'Live', className: 'live-badge--on' },
  reconnecting: { text: 'Reconnecting…', className: 'live-badge--pending' },
  disconnected: { text: 'Offline', className: 'live-badge--off' },
};

export function LiveStatusBadge({ status }) {
  const { text, className } = LABELS[status] ?? LABELS.disconnected;

  return (
    <span
      className={`live-badge ${className}`}
      role="status"
      aria-live="polite"
      title="Real-time connection to the server (SignalR)"
    >
      <span className="live-badge__dot" aria-hidden="true" />
      {text}
    </span>
  );
}
