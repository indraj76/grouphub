export default function ErrorState({ message, onRetry }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="font-semibold text-red-700">Couldn't load data</p><p className="mt-1 text-sm text-red-600">{message}</p>{onRetry && <button onClick={onRetry} className="btn-primary mt-4">Retry</button>}</div>
}
