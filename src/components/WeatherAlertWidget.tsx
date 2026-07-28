import React, { useState, useEffect } from 'react';
import { AlertCircle, Cloud, RefreshCw } from 'lucide-react';

interface WeatherData {
  main: { temp: number };
  weather: { description: string, icon: string }[];
  name: string;
}

export const WeatherAlertWidget: React.FC<{ city: string }> = ({ city }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!response.ok) throw new Error('Hava durumu verisi alınamadı.');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Hava durumu bilgisine ulaşılamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city]);

  if (loading) return <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Yükleniyor...</div>;
  if (error) return <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>;
  if (!weather) return null;

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center gap-4 animate-in fade-in duration-300">
      <Cloud className="w-8 h-8 text-blue-500" />
      <div>
        <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">{weather.name} Hava Durumu</h4>
        <p className="text-blue-700 dark:text-blue-300 text-xs">
          {Math.round(weather.main.temp)}°C, {weather.weather[0].description}
        </p>
      </div>
      {weather.main.temp > 30 && (
        <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Sıcak Uyarı</span>
      )}
    </div>
  );
};
