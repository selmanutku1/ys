import React, { useState, useEffect } from 'react';
import { AlertCircle, Cloud, RefreshCw, Sun, CloudRain, Wind } from 'lucide-react';

interface WeatherData {
  main: { temp: number };
  weather: { description: string, icon: string }[];
  name: string;
}

interface ForecastData {
  list: {
    dt: number;
    main: { temp: number };
    weather: { description: string, icon: string }[];
  }[];
}

export const WeatherWidget: React.FC<{ city: string }> = ({ city }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?city=${encodeURIComponent(city)}`),
        fetch(`/api/weather?city=${encodeURIComponent(city)}&forecast=true`)
      ]);
      
      if (!weatherRes.ok || !forecastRes.ok) throw new Error('Hava durumu verisi alınamadı.');
      
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError('Hava durumu bilgisine ulaşılamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [city]);

  if (loading) return <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Yükleniyor...</div>;
  if (error) return <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>;
  if (!weather || !forecast) return null;

  // Process forecast: get one item per day for next 3 days
  const dailyForecast = forecast.list.filter((item, index) => index % 8 === 0).slice(0, 3);

  return (
    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Cloud className="w-10 h-10 text-blue-500" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">{weather.name}</h4>
            <p className="text-blue-700 dark:text-blue-300">
              {Math.round(weather.main.temp)}°C, {weather.weather[0].description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {dailyForecast.map((day, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm">
            <p className="text-xs text-gray-500">{new Date(day.dt * 1000).toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
            <p className="font-bold text-blue-900 dark:text-blue-100">{Math.round(day.main.temp)}°C</p>
            <p className="text-[10px] text-gray-400 capitalize">{day.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
