import { BandSlot } from './BandSlot';
import { parseTime, DaySchedule } from '../data/schedule';

interface ScheduleGridProps {
  dayData: DaySchedule;
  selectionState: Record<string, string>;
  onToggleSelection: (bandId: string, currentState: string) => void;
  viewMode: 'simple' | 'detailed';
}

export const ScheduleGrid = ({ dayData, selectionState, onToggleSelection, viewMode }: ScheduleGridProps) => {
  // Find the earliest start time and the latest end time across the active day
  let earliestMins = Number.MAX_SAFE_INTEGER;
  let latestMins = 0;

  dayData.stages.forEach(stage => {
    stage.bands.forEach(band => {
      const start = parseTime(band.start);
      const end = parseTime(band.end);
      if (start < earliestMins) earliestMins = start;
      if (end > latestMins) latestMins = end;
    });
  });

  // Subtract a bit of padding to the top (maybe 30 mins)
  const topPadding = 30;
  const startLine = earliestMins - topPadding;
  const totalDuration = (latestMins + 30) - startLine;
  
  // Use a larger scale for detailed view to fit the text (6px per min gives much more room)
  const pxPerMinute = viewMode === 'detailed' ? 6 : 2; 
  const containerHeight = totalDuration * pxPerMinute;

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2 className="schedule-title">{dayData.date}</h2>
      </div>
      <div className="schedule-grid-container">
        {dayData.stages.map((stage) => (
          <div key={stage.name} className="stage-column">
            <div className="stage-header">
              <div className="stage-name">{stage.name}</div>
              {dayData.doors[stage.name] && (
                <div className="stage-doors">DOORS {dayData.doors[stage.name]}</div>
              )}
            </div>
            {/* The actual timeline where items are absolute positioned */}
            <div className="timeline" style={{ height: `${containerHeight}px` }}>
              {stage.bands.map((band) => (
                <BandSlot 
                  key={band.name} 
                  day={dayData.day}
                  stage={stage.name}
                  band={band}
                  earliestTime={startLine}
                  selectionState={selectionState}
                  onToggleSelection={onToggleSelection}
                  viewMode={viewMode}
                  pxPerMinute={pxPerMinute}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
