export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-label">{progress}%</span>
    </div>
  )
}
