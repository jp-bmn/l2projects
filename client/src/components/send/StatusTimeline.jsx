const STAGES = [
  { key: 'queued', label: 'Q', title: 'Queued' },
  { key: 'sent', label: 'S', title: 'Sent' },
  { key: 'delivered', label: 'D', title: 'Delivered' },
];

const STATUS_ORDER = { queued: 0, sent: 1, delivered: 2 };

function getStageState(stageKey, currentStatus) {
  if (currentStatus === 'failed') return 'failed';
  const stageIdx = STATUS_ORDER[stageKey] ?? -1;
  const currentIdx = STATUS_ORDER[currentStatus] ?? -1;
  if (stageIdx < currentIdx) return 'completed';
  if (stageIdx === currentIdx) return 'current';
  return 'pending';
}

export default function StatusTimeline({ status }) {
  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const state = getStageState(stage.key, status);
        const isLast = i === STAGES.length - 1;

        let circleClass = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ';
        if (state === 'completed') circleClass += 'bg-success text-bg';
        else if (state === 'current' && status === 'failed') circleClass += 'bg-danger text-white';
        else if (state === 'current') circleClass += 'bg-success text-bg animate-pulse';
        else circleClass += 'bg-border text-text-dim';

        const lineClass = `h-0.5 w-6 ${
          state === 'completed' ? 'bg-success' : 'bg-border'
        }`;

        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={circleClass} title={stage.title}>
                {stage.label}
              </div>
            </div>
            {!isLast && <div className={lineClass}></div>}
          </div>
        );
      })}
    </div>
  );
}
