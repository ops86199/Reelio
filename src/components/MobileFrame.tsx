import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Sparkles } from 'lucide-react';
import { DeviceViewMode } from '../types';

interface MobileFrameProps {
  deviceMode: DeviceViewMode;
  onChangeDeviceMode: (mode: DeviceViewMode) => void;
  children: React.ReactNode;
  onOpenCrossPlatformInfo: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  deviceMode,
  onChangeDeviceMode,
  children,
  onOpenCrossPlatformInfo,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // When in standard responsive mode, render children normally with clean layout
  if (deviceMode === 'responsive') {
    return <>{children}</>;
  }

  const isIOS = deviceMode === 'mobile_ios';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start p-2 sm:p-6 overflow-x-hidden">
      {/* Top Simulator Control Bar */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-md text-white text-xs z-30 shadow-lg">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span>Mobile App Preview</span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => onChangeDeviceMode('mobile_ios')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              isIOS ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => onChangeDeviceMode('mobile_android')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              !isIOS ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Android
          </button>
        </div>

        <button
          onClick={() => onChangeDeviceMode('responsive')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg transition-colors font-medium text-[11px]"
          title="Switch to full desktop browser view"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit Frame</span>
        </button>
      </div>

      {/* Realistic Smartphone Chassis Frame */}
      <div className="relative w-full max-w-[400px] h-[844px] bg-black rounded-[52px] shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_0_12px_#18181b,0_0_0_14px_#27272a] overflow-hidden flex flex-col border-[4px] border-zinc-800">
        {/* Dynamic Island / Status Bar */}
        <div className="relative z-50 h-11 bg-black text-white px-7 flex items-center justify-between text-xs font-semibold select-none shrink-0">
          <span>{currentTime}</span>

          {/* Dynamic Island Pill (iOS) or Punch-hole Camera (Android) */}
          {isIOS ? (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 bg-black rounded-full border border-zinc-900 flex items-center justify-between px-2 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 ring-1 ring-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
            </div>
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 bg-zinc-950 rounded-full ring-2 ring-zinc-900" />
          )}

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Smartphone Screen Content */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar relative bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="h-5 bg-white dark:bg-black flex items-center justify-center shrink-0 z-50">
          <div className="w-32 h-1 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
