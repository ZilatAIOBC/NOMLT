// React import not required with modern JSX runtimes

export interface PlanListItem {
  id: string;
  name: string;
  price: number;
  credits: number;
  isActive: boolean;
}

export function PlansList({ plans, selectedPlan, onSelect }: {
  plans: PlanListItem[];
  selectedPlan: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`rounded-lg border p-6 cursor-pointer transition-all ${
            selectedPlan === plan.id
              ? 'border-[#823AEA] shadow-lg shadow-[#823AEA]/20'
              : 'border-white/10 hover:border-white/20'
          }`}
          style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
          onClick={() => onSelect(plan.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="text-2xl font-bold text-white mb-1">
                ${plan.price}
                <span className="text-sm text-gray-400 font-normal">/monthly</span>
              </div>
              <div className="text-sm text-gray-400">
                {plan.credits.toLocaleString()} credits included
              </div>
            </div>
            {plan.isActive && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                Active
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlansList;


