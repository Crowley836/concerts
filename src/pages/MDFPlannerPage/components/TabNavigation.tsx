interface TabNavigationProps {
  days: string[];
  activeDay: string;
  onSelectDay: (day: string) => void;
}

export const TabNavigation = ({ days, activeDay, onSelectDay }: TabNavigationProps) => {
  return (
    <div className="tabs">
      {days.map(day => (
        <button 
          key={day}
          className={`tab-btn ${activeDay === day ? 'active' : ''}`}
          onClick={() => onSelectDay(day)}
        >
          {day.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
