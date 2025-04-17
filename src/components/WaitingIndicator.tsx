import React, { useEffect, useState } from 'react';

interface WaitingIndicatorProps {
  isWaiting: boolean;
  startTime: number | null;
}

export const WaitingIndicator: React.FC<WaitingIndicatorProps> = ({ isWaiting, startTime }) => {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isWaiting && startTime) {
      const updateElapsedTime = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000); // seconds
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };

      // Update immediately
      updateElapsedTime();

      // Then update every second
      intervalId = setInterval(updateElapsedTime, 1000);
    } else {
      setElapsedTime('00:00');
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isWaiting, startTime]);

  if (!isWaiting) return null;

  return (
    <div className="waiting-indicator">
      <div className="waiting-spinner"></div>
      <div className="waiting-time">Waiting for response... {elapsedTime}</div>
    </div>
  );
};
