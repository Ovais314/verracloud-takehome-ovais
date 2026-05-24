export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-message state-message--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="state-message__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
