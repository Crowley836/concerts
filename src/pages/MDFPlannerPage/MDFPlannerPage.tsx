import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './MDFPlanner.css';
import { scheduleData } from './data/schedule';
import { TabNavigation } from './components/TabNavigation';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PRIORITY_LEVELS = ['unselected', 'mustsee', 'target', 'convenient'];

export const MDFPlannerPage = () => {
  const [activeDay, setActiveDay] = useState(scheduleData[0].day);
  const [selectionState, setSelectionState] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  useEffect(() => {
    const savedState = sessionStorage.getItem('mdfPlannerState');
    if (savedState) {
      setSelectionState(JSON.parse(savedState));
    }
  }, []);

  const handleToggleSelection = (bandId: string, currentState: string) => {
    const currentIndex = PRIORITY_LEVELS.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % PRIORITY_LEVELS.length;
    
    const newState = {
      ...selectionState,
      [bandId]: PRIORITY_LEVELS[nextIndex]
    };

    setSelectionState(newState);
    sessionStorage.setItem('mdfPlannerState', JSON.stringify(newState));
  };

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'simple' ? 'detailed' : 'simple');
  };

  const handleCaptureScreenshot = async () => {
    const target = document.querySelector('.mdf-planner-root');
    if (!target) return;
    
    try {
      // Hide elements with 'data-html2canvas-ignore' class if any, or html2canvas handles the attribute natively
      const canvas = await html2canvas(target as HTMLElement, {
        backgroundColor: '#050505', // Matches app background
        scale: 2 // For better resolution
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `mdf-planner-${activeDay}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot', err);
    }
  };

  const activeDayData = scheduleData.find(d => d.day === activeDay);

  return (
    <div className="mdf-planner-root">
      {/* Back button fixed to top left */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-50 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        aria-label="Back to Concerts"
      >
        <ArrowLeft size={24} />
      </Link>

      <div className="app-container">
        <header className="header">
          <h1>MDF<span className="header-accent">2026</span> SET TIMES</h1>
          <div className="header-controls">
            <TabNavigation 
              days={scheduleData.map(d => d.day)} 
              activeDay={activeDay}
              onSelectDay={setActiveDay} 
            />
            <button
              className="view-toggle-btn"
              onClick={handleToggleViewMode}
              data-html2canvas-ignore
              title="Toggle Detailed View"
            >
              {viewMode === 'simple' ? '🔍 Details' : '➖ Simple'}
            </button>
            <button 
              className="screenshot-btn" 
              onClick={handleCaptureScreenshot}
              data-html2canvas-ignore
              title="Download Screenshot"
            >
              📸
            </button>
          </div>
        </header>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color unselected"></div>
            <span>Unselected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color mustsee"></div>
            <span>Must See</span>
          </div>
          <div className="legend-item">
            <div className="legend-color target"></div>
            <span>Target</span>
          </div>
          <div className="legend-item">
            <div className="legend-color convenient"></div>
            <span>If Convenient</span>
          </div>
        </div>

        <main>
          {activeDayData && (
            <ScheduleGrid 
              dayData={activeDayData} 
              selectionState={selectionState}
              onToggleSelection={handleToggleSelection}
              viewMode={viewMode}
            />
          )}
        </main>
      </div>
    </div>
  );
};
