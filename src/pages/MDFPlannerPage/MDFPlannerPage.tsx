import { useEffect } from 'react';
import './MDFPlanner.css';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const MDFPlannerPage = () => {
  useEffect(() => {
    // Allow native scrolling and pinch-zoom on this page
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  return (
    <div className="mdf-planner-root">
      {/* Ambient Blurred Background */}
      <div 
        className="mdf-ambient-bg" 
        style={{ backgroundImage: `url('/mdf-2027.jpg')` }}
      />
      
      {/* Back button fixed to top left */}
      <Link 
        to="/" 
        className="mdf-back-btn"
        aria-label="Back to Concerts"
      >
        <ArrowLeft size={24} />
      </Link>

      <div className="mdf-poster-container">
        <div className="mdf-poster-card">
          <img 
            src="/mdf-2027.jpg" 
            alt="Maryland Deathfest XXII 2027 Flyer" 
            className="mdf-poster-img"
          />
        </div>
      </div>
    </div>
  );
};

