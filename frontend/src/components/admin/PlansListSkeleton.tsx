export default function PlansListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-white/10 p-6 animate-pulse"
          style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #0D131F 100%)' }}
        >
          <div className="flex justify-between items-start">
            <div className="w-full">
              <div className="h-5 bg-white/10 rounded w-40 mb-3" />
              <div className="h-7 bg-white/10 rounded w-28 mb-2" />
              <div className="h-4 bg-white/10 rounded w-48" />
            </div>
            <div className="h-5 w-16 bg-white/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}


