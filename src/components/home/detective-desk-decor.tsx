function VinylPlayer() {
  return (
    <svg viewBox="0 0 240 170" role="presentation">
      <defs>
        <linearGradient id="player-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f432d" />
          <stop offset="0.45" stopColor="#3f241c" />
          <stop offset="1" stopColor="#1f1412" />
        </linearGradient>
        <radialGradient id="vinyl-grooves">
          <stop offset="0" stopColor="#2b2928" />
          <stop offset="0.5" stopColor="#111214" />
          <stop offset="0.76" stopColor="#272627" />
          <stop offset="1" stopColor="#090a0b" />
        </radialGradient>
        <linearGradient id="player-chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#797b7d" />
          <stop offset="0.5" stopColor="#f2e8d6" />
          <stop offset="1" stopColor="#67696b" />
        </linearGradient>
        <filter id="player-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1b1110" floodOpacity="0.38" />
        </filter>
      </defs>
      <g filter="url(#player-shadow)">
        <path d="M18 26 214 17c8 0 14 6 14 14v105c0 8-6 14-14 15L24 158c-8 0-14-6-14-14V40c0-8 3-13 8-14Z" fill="url(#player-wood)" stroke="#211512" strokeWidth="4" />
        <path d="M25 37 209 29c4 0 7 3 7 7v91c0 4-3 7-7 7l-184 8c-3 0-6-3-6-7V44c0-4 3-7 6-7Z" fill="none" stroke="#b57947" strokeOpacity="0.38" strokeWidth="2" />
        <g className="desk-vinyl-disc">
          <circle cx="93" cy="86" r="54" fill="url(#vinyl-grooves)" stroke="#08090a" strokeWidth="3" />
          {[45, 38, 30, 22].map((radius) => (
            <circle key={radius} cx="93" cy="86" r={radius} fill="none" stroke="#8e8b84" strokeOpacity="0.18" strokeWidth="0.8" />
          ))}
          <circle cx="93" cy="86" r="16" fill="#d96b32" stroke="#f0a34d" strokeWidth="2" />
          <circle cx="93" cy="86" r="3" fill="#171515" />
          <path d="M54 53c19-18 51-22 74-7" fill="none" stroke="#fff9e8" strokeLinecap="round" strokeOpacity="0.22" strokeWidth="3" />
        </g>
        <g>
          <circle cx="182" cy="52" r="13" fill="#27211e" stroke="#c28a55" strokeWidth="3" />
          <path d="m182 55-15 46-28 18" fill="none" stroke="url(#player-chrome)" strokeLinecap="round" strokeWidth="7" />
          <path d="m139 119-12 3" fill="none" stroke="#171515" strokeLinecap="round" strokeWidth="8" />
          <circle cx="182" cy="52" r="5" fill="#e9dcc7" />
        </g>
        <circle className="desk-power-led" cx="199" cy="119" r="5" fill="#ff9b42" stroke="#2b1712" strokeWidth="2" />
        <circle cx="199" cy="119" r="1.8" fill="#fff1cf" />
      </g>
    </svg>
  );
}

function VintageRadio() {
  return (
    <svg viewBox="0 0 300 190" role="presentation">
      <defs>
        <linearGradient id="radio-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c4d31" />
          <stop offset="0.5" stopColor="#4c2b20" />
          <stop offset="1" stopColor="#241613" />
        </linearGradient>
        <linearGradient id="radio-dial-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#be6a2f" />
          <stop offset="0.48" stopColor="#ffcd78" />
          <stop offset="1" stopColor="#9f5529" />
        </linearGradient>
        <radialGradient id="radio-brass" cx="35%" cy="28%" r="75%">
          <stop offset="0" stopColor="#fff0a8" />
          <stop offset="0.4" stopColor="#c7963e" />
          <stop offset="1" stopColor="#5a3918" />
        </radialGradient>
        <pattern id="speaker-cloth" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#b3956e" />
          <path d="M0 1h7M1 0v7" stroke="#594634" strokeOpacity="0.55" strokeWidth="1" />
        </pattern>
        <filter id="radio-shadow" x="-25%" y="-30%" width="150%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1f1310" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#radio-shadow)">
        <path d="M31 33c5-13 17-20 31-20h176c15 0 27 7 33 20l12 29v102c0 8-6 14-14 14H30c-8 0-14-6-14-14V62Z" fill="url(#radio-wood)" stroke="#261713" strokeWidth="5" />
        <path d="M34 62h232" stroke="#c1844d" strokeOpacity="0.45" strokeWidth="2" />
        <rect x="37" y="75" width="125" height="72" rx="11" fill="url(#speaker-cloth)" stroke="#2c1c17" strokeWidth="4" />
        <rect x="177" y="76" width="79" height="43" rx="8" fill="#201c1a" stroke="#bf8b4a" strokeWidth="3" />
        <rect x="184" y="83" width="65" height="29" rx="4" fill="url(#radio-dial-glow)" opacity="0.86" />
        <g stroke="#3f271c" strokeWidth="1.3">
          {[190, 201, 212, 223, 234, 245].map((x) => (
            <path key={x} d={`M${x} 87v7`} />
          ))}
        </g>
        <path className="desk-radio-needle" d="M225 84v27" stroke="#70231d" strokeWidth="2.5" />
        <text x="216.5" y="103" fill="#37231b" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="800" textAnchor="middle">CHANNEL 84</text>
        <circle cx="195" cy="143" r="17" fill="url(#radio-brass)" stroke="#231613" strokeWidth="3" />
        <circle cx="239" cy="143" r="17" fill="url(#radio-brass)" stroke="#231613" strokeWidth="3" />
        <path d="M195 131v8M239 131v8" stroke="#3f2919" strokeLinecap="round" strokeWidth="3" />
        <circle className="desk-radio-led" cx="178" cy="154" r="4.5" fill="#ff9b42" stroke="#261713" strokeWidth="2" />
        <path d="M52 39c49-12 147-12 198 0" fill="none" stroke="#fff0d7" strokeLinecap="round" strokeOpacity="0.15" strokeWidth="4" />
      </g>
    </svg>
  );
}

export function DetectiveDeskDecor() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="desk-vinyl-player"><VinylPlayer /></div>
      <div className="desk-vintage-radio"><VintageRadio /></div>
    </div>
  );
}
