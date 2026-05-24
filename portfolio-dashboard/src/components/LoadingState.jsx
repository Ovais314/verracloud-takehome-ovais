export function LoadingState({ message = 'Loading holdings…' }) {
  return (
    <div className="state-message" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      {message}
    </div>
  );
}
