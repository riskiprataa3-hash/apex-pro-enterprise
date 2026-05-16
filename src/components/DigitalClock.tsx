import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeZoneData {
  name: string;
  offset: string;
  timezone: string;
}

const DigitalClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const timeZones: TimeZoneData[] = [
    { name: 'New York', offset: 'America/New_York', timezone: 'EST/EDT' },
    { name: 'London', offset: 'Europe/London', timezone: 'GMT/BST' },
    { name: 'Tokyo', offset: 'Asia/Tokyo', timezone: 'JST' },
    { name: 'Sydney', offset: 'Australia/Sydney', timezone: 'AEDT/AEST' },
    { name: 'Dubai', offset: 'Asia/Dubai', timezone: 'GST' },
    { name: 'Singapore', offset: 'Asia/Singapore', timezone: 'SGT' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeInTimeZone = (timezone: string): string => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      return formatter.format(currentTime);
    } catch (error) {
      return 'N/A';
    }
  };

  const getDateInTimeZone = (timezone: string): string => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(currentTime);
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <Clock className="w-10 h-10 text-purple-400 mr-3" />
          <h1 className="text-4xl font-bold text-white">World Time Zones</h1>
        </div>

        {/* Main Clock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeZones.map((tz) => (
            <div
              key={tz.offset}
              className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 shadow-xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/20"
            >
              {/* Location Name */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{tz.name}</h2>
                <span className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                  {tz.timezone}
                </span>
              </div>

              {/* Digital Time Display */}
              <div className="bg-slate-900 rounded-lg p-6 mb-4 border border-purple-500/30">
                <div className="font-mono text-4xl font-bold text-green-400 tracking-wider">
                  {getTimeInTimeZone(tz.offset)}
                </div>
              </div>

              {/* Date Display */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {getDateInTimeZone(tz.offset)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Local Time */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center">
          <p className="text-gray-200 text-sm mb-2">Your Local Time</p>
          <p className="font-mono text-5xl font-bold text-white">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
          <p className="text-gray-100 mt-2">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-gray-300 text-center text-sm">
            ⏰ Clock updates every second | Displaying major time zones around the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;
