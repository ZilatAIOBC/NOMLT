import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface UsageTimelineChartProps {
  className?: string;
}

export default function UsageTimelineChart({ className = "" }: UsageTimelineChartProps) {

  // Generate data for 30 days with a smooth wave pattern
  const data = Array.from({ length: 30 }, (_, i) => {
    const day = 30 - i;
    const value = 150 + Math.sin((i / 30) * Math.PI * 3) * 100 + Math.cos((i / 20) * Math.PI * 2) * 50;
    return {
      day,
      credits: Math.round(value),
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
          <div>{payload[0].value} Credits</div>
          <div className="text-xs text-purple-200">May 22</div>
        </div>
      );
    }
    return null;
  };

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
