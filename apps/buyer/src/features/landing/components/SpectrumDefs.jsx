// Gradient dùng chung cho nét các biểu tượng lucide (stroke="url(#landingSpectrum)")
export default function SpectrumDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <defs>
        <linearGradient id="landingSpectrum" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="0.4" stopColor="#0a68ff" />
          <stop offset="0.75" stopColor="#059669" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
