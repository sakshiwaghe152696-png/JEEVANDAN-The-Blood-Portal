export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div
      className="relative overflow-hidden
      bg-gradient-to-br from-[#141414] to-[#0f0f0f]
      border border-[#1f1f1f] rounded-xl p-6
      transition-all duration-300
      hover:scale-[1.02]
      hover:border-red-600
      hover:shadow-[0_0_25px_rgba(220,38,38,0.15)]"
    >
      {/* Subtle glow layer */}
      <div className="pointer-events-none absolute inset-0 opacity-0
        hover:opacity-100 transition
        bg-gradient-to-r from-transparent via-red-600/5 to-transparent" />

      {/* Top-right Icon */}
      {Icon && (
        <div className="absolute top-4 right-4
          bg-red-600/10 text-red-500
          p-2 rounded-lg">
          <Icon size={20} />
        </div>
      )}

      {/* Title */}
      <p className="text-sm text-gray-400 uppercase tracking-wide">
        {title}
      </p>

      {/* Subtitle */}
      <p className="text-xs text-gray-500 mt-1">
        Total Registered
      </p>

      {/* Value */}
      <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">
        {value}
      </h3>
    </div>
  );
}
