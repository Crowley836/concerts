import { parseTime, Band } from '../data/schedule';

interface BandSlotProps {
  band: Band;
  day: string;
  stage: string;
  selectionState: Record<string, string>;
  onToggleSelection: (bandId: string, currentState: string) => void;
  earliestTime: number;
  pxPerMinute?: number;
}

export const BandSlot = ({ band, day, stage, selectionState, onToggleSelection, earliestTime, pxPerMinute = 2 }: BandSlotProps) => {
  const startMins = parseTime(band.start);
  const endMins = parseTime(band.end);
  const duration = endMins - startMins;
  
  const topPosition = (startMins - earliestTime) * pxPerMinute;
  const height = duration * pxPerMinute;

  const bandId = `${band.name}-${day}-${stage}`.replace(/\s+/g, '-').toLowerCase();
  const state = selectionState[bandId] || 'unselected';

  const handleClick = () => {
    onToggleSelection(bandId, state);
  };

  return (
    <div 
      className={`band-slot ${state}`}
      style={{ top: `${topPosition}px`, height: `${height}px` }}
      onClick={handleClick}
    >
      <div className="band-name">{band.name}</div>
      <div className="band-time">{band.start}-{band.end}</div>
    </div>
  );
};
