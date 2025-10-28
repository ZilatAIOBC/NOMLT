import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getDailyTrends } from '../../services/analyticsService';

interface UsageTimelineChartProps {
  className?: string;
}

interface ChartDataPoint {
  day: string;
  credits: number;
  date: string;
}

export default function UsageTimelineChart({ className = "" }: UsageTimelineChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyTrends();
  }, []);

  const fetchDailyTrends = async () => {
    try {
      setLoading(true);
      const response = await getDailyTrends(30);

      // Helper: format a JS Date to YYYY-MM-DD using UTC parts (avoid TZ shift)
      const formatDateUTC = (d: Date) => {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      // Map API results by UTC date (YYYY-MM-DD)
      const creditsByDate: Record<string, number> = {};
      (response.trends || []).forEach((t) => {
        const key = (t.date || '').split('T')[0]; // backend already returns YYYY-MM-DD
        creditsByDate[key] = (t.total_credits_spent || 0);
      });

      // Build days 1..30 for the CURRENT MONTH (so x=9 means the 9th of this month)
      const days: ChartDataPoint[] = [];
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth(); // 0-based
      for (let dayNum = 1; dayNum <= 30; dayNum++) {
        const d = new Date(Date.UTC(year, month, dayNum, 0, 0, 0));
        const iso = formatDateUTC(d);
        const displayDate = new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        days.push({
          day: String(dayNum),
          credits: creditsByDate[iso] || 0,
          date: displayDate
        });
      }

      setData(days);
    } catch (error) {
      // Fallback: show 30 days of zeros to keep the UI intact
      const fallback: ChartDataPoint[] = [];
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      for (let dayNum = 1; dayNum <= 30; dayNum++) {
        const d = new Date(Date.UTC(year, month, dayNum, 0, 0, 0));
        fallback.push({
          day: String(dayNum),
          credits: 0,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
          <div>{payload[0].value} Credits</div>
          <div className="text-xs text-purple-200">{payload[0].payload.date}</div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        {/* Skeleton Chart */}
        <div className="relative h-64 mt-4 border border-white/10 bg-[#0F0F0F]">
          <div className="w-full h-full flex items-end justify-between px-4 py-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex-1 mx-0.5">
                <div 
                  className="w-full bg-white/10 rounded-t animate-pulse" 
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4">
          <div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Chart */}
      <div className="relative h-64   mt-4 border border-white/10" >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 20, right: 15, left: 15, bottom: 35 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              stroke="#4b5563"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#7c3aed', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="credits" 
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 rounded-sm bg-purple-600"></div>
          <span className="text-gray-300 text-sm font-medium">Daily Usage</span>
        </div>
      </div>
    </div>
  );
}
