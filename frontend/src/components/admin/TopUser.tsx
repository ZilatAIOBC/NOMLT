

interface TopUserProps {
  rank: number;
  name: string;
  credits: number;
  estimatedCost: string;
}

const TopUser = ({ rank, name, credits, estimatedCost }: TopUserProps) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-lg mb-3 bg-[#080808] border border-white/5">
    <div className="flex items-center gap-4">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
        style={{ backgroundColor: '#8A3FFC' }}
      >
        {rank}
      </div>
      <div>
        <div className="text-white text-sm font-medium">{name}</div>
        <div className="text-gray-500 text-xs">{credits.toLocaleString()} credits used</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm font-semibold" style={{ color: '#8A3FFC' }}>{estimatedCost}</div>
      <div className="text-gray-500 text-xs">estimated cost</div>
    </div>
  </div>
);

export default TopUser;
