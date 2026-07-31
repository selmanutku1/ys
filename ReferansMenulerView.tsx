import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnline(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      
      const pendingData = localStorage.getItem('kys_pending_sync');
      const remoteQueue = localStorage.getItem('kys_remote_queue');
      let hasData = false;
      if (pendingData) {
        try {
          const parsed = JSON.parse(pendingData);
          if (Object.keys(parsed).length > 0) {
            hasData = true;
          }
        } catch(e) {}
      }
      if (remoteQueue) {
        try {
          const parsed = JSON.parse(remoteQueue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            hasData = true;
          }
        } catch(e) {}
      }
      
      setHasPendingSync(hasData);
      
      // Auto-hide if no manual sync needed
      if (!hasData) {
        setTimeout(() => {
          setShowBackOnline(false);
        }, 4000);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Initial check for pending data if we are online right now
    if (navigator.onLine) {
        const pendingData = localStorage.getItem('kys_pending_sync');
        const remoteQueue = localStorage.getItem('kys_remote_queue');
        let hasD = false;
        if (pendingData) {
            try {
                const parsed = JSON.parse(pendingData);
                if (Object.keys(parsed).length > 0) {
                    hasD = true;
                }
            } catch(e) {}
        }
        if (remoteQueue) {
            try {
                const parsed = JSON.parse(remoteQueue);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    hasD = true;
                }
            } catch(e) {}
        }
        if (hasD) {
            setShowBackOnline(true);
            setHasPendingSync(true);
        }
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    let anyError = false;
    
    // Sync remote queue (apply endpoints)
    const remoteQueue = localStorage.getItem('kys_remote_queue');
    if (remoteQueue) {
      try {
        const parsedQueue = JSON.parse(remoteQueue);
        if (Array.isArray(parsedQueue) && parsedQueue.length > 0) {
          const newQueue = [];
          for (const item of parsedQueue) {
            try {
              const res = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              });
              if (!res.ok) newQueue.push(item);
            } catch(e) {
              newQueue.push(item);
              anyError = true;
            }
          }
          if (newQueue.length === 0) {
            localStorage.removeItem('kys_remote_queue');
          } else {
            localStorage.setItem('kys_remote_queue', JSON.stringify(newQueue));
            anyError = true;
          }
        } else {
          localStorage.removeItem('kys_remote_queue');
        }
      } catch (err) {
        console.error("Error during remote queue sync:", err);
        anyError = true;
      }
    }

    // Sync state updates
    const pendingData = localStorage.getItem('kys_pending_sync');
    if (pendingData) {
      try {
        const parsed = JSON.parse(pendingData);
        if (Object.keys(parsed).length > 0) {
          const res = await fetch('/api/state/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: pendingData
          });
          if (res.ok) {
            localStorage.removeItem('kys_pending_sync');
          } else {
            anyError = true;
          }
        } else {
            localStorage.removeItem('kys_pending_sync');
        }
      } catch (err) {
        console.error("Error during manual sync:", err);
        anyError = true;
      }
    }
    
    setIsSyncing(false);
    if (!anyError) {
      setHasPendingSync(false);
      setShowBackOnline(false);
    } else {
      alert("Bazı veriler senkronize edilemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  if (!isOffline && !showBackOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-500 flex justify-center p-2 pointer-events-none`}>
      <div className={`pointer-events-auto shadow-lg rounded-xl flex items-center gap-3 px-4 py-3 border ${isOffline ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} animate-in slide-in-from-top-full fade-in`}>
        {isOffline ? (
          <>
            <div className="bg-amber-100 p-2 rounded-full">
              <WifiOff className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold">İnternet Bağlantısı Koptu</p>
              <p className="text-xs opacity-80 font-medium">Yerel depolama modu aktif. Verileriniz cihazınızda güvende.</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-emerald-100 p-2 rounded-full">
              <Wifi className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold">Bağlantı Yeniden Sağlandı</p>
              <p className="text-xs opacity-80 font-medium">{hasPendingSync ? 'Yerel değişiklikler sunucu ile senkronize edilebilir.' : 'Sistem güncel.'}</p>
            </div>
            {hasPendingSync && (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
              </button>
            )}
            {!isSyncing && (
              <button 
                onClick={() => setShowBackOnline(false)}
                className="ml-1 text-emerald-700 hover:bg-emerald-100 p-1 rounded-md transition"
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
