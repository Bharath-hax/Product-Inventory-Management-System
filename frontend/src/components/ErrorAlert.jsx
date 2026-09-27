export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="ml-4 font-medium underline hover:no-underline">
          Retry
        </button>
      )}
    </div>
  );
}
