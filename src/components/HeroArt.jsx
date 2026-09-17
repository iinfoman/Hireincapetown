/**
 * The hero artwork: the Southern Suburbs at dusk under Table Mountain.
 *
 * Drawn rather than photographed, on purpose. A hero photograph at a usable
 * size costs 40–80 KB even as WebP; this is roughly 2 KB inline with no extra
 * request, which matters when the visitor is on a prepaid data bundle. It also
 * avoids the tourist-postcard stock shot, which is exactly what a directory of
 * working tradespeople should not look like.
 *
 * The scene is chosen to say what the product does: homes, in the evening,
 * with lights on — the moment a geyser bursts and you need someone now.
 *
 * To swap in real photography later, replace this component's <svg> with a
 * <picture> element; nothing else in Home.jsx needs to change.
 */
export const HeroArt = () => (
  <svg
    className="pointer-events-none absolute inset-x-0 bottom-[68px] h-[150px] w-full md:bottom-0 md:h-[290px]"
    viewBox="0 0 1440 340"
    preserveAspectRatio="xMinYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      {/* Fades the art into the flat background so the headline never sits on detail. */}
      <linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#161C24" stopOpacity="1" />
        <stop offset="38%" stopColor="#161C24" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#161C24" />
        <stop offset="100%" stopColor="#222C3A" />
      </linearGradient>
    </defs>

    <rect width="1440" height="340" fill="url(#hero-sky)" />

    {/* Far ridge — the Hottentots Holland across the bay, flattened by distance. */}
    <path
      d="M0 206 L96 194 L188 200 L266 178 L352 190 L438 172 L540 186 L648 170 L742 182 L848 168
         L962 180 L1066 166 L1170 178 L1284 164 L1382 176 L1440 168 L1440 340 L0 340 Z"
      fill="#1E2835"
    />

    {/* Lion's Head, the Table, Devil's Peak. The flat top is the whole silhouette. */}
    <path
      d="M0 250 L70 240 L150 214 L214 150 L262 120 L316 150 L372 206 L446 186 L520 108
         L980 108 L1078 190 L1156 140 L1222 168 L1310 214 L1400 234 L1440 228 L1440 340 L0 340 Z"
      fill="#283443"
    />
    {/* The protea line tracing the ridge — the one place the brand colour appears here. */}
    <path
      d="M0 250 L70 240 L150 214 L214 150 L262 120 L316 150 L372 206 L446 186 L520 108
         L980 108 L1078 190 L1156 140 L1222 168 L1310 214 L1400 234 L1440 228"
      fill="none"
      stroke="#A8325A"
      strokeOpacity="0.55"
      strokeWidth="1.6"
    />

    {/* Rooftops: pitched suburban houses, the kind that need a plumber at 21:40. */}
    <g fill="#161C24">
      <path d="M-20 340 L-20 296 L34 262 L88 296 L88 268 L140 238 L192 268 L192 306 L250 274 L308 306 L308 340 Z" />
      <path d="M296 340 L296 292 L352 258 L408 292 L408 274 L462 244 L516 274 L516 312 L574 282 L632 312 L632 340 Z" />
      <path d="M620 340 L620 300 L678 266 L736 300 L736 262 L790 230 L844 262 L844 300 L900 270 L958 300 L958 340 Z" />
      <path d="M946 340 L946 288 L1002 254 L1058 288 L1058 270 L1114 238 L1170 270 L1170 308 L1228 278 L1286 308 L1286 340 Z" />
      <path d="M1274 340 L1274 296 L1330 262 L1386 296 L1386 268 L1440 238 L1460 252 L1460 340 Z" />
    </g>

    {/* Lit windows. Deliberately uneven — a street where some people are still up. */}
    <g fill="#E8A317">
      <rect x="24" y="300" width="9" height="12" rx="1.5" opacity="0.85" />
      <rect x="52" y="300" width="9" height="12" rx="1.5" opacity="0.35" />
      <rect x="150" y="278" width="9" height="12" rx="1.5" opacity="0.8" />
      <rect x="264" y="310" width="9" height="12" rx="1.5" opacity="0.5" />
      <rect x="342" y="296" width="9" height="12" rx="1.5" opacity="0.75" />
      <rect x="470" y="282" width="9" height="12" rx="1.5" opacity="0.4" />
      <rect x="592" y="318" width="9" height="12" rx="1.5" opacity="0.7" />
      <rect x="668" y="304" width="9" height="12" rx="1.5" opacity="0.9" />
      <rect x="800" y="270" width="9" height="12" rx="1.5" opacity="0.45" />
      <rect x="862" y="306" width="9" height="12" rx="1.5" opacity="0.65" />
      <rect x="1012" y="292" width="9" height="12" rx="1.5" opacity="0.8" />
      <rect x="1124" y="276" width="9" height="12" rx="1.5" opacity="0.5" />
      <rect x="1244" y="314" width="9" height="12" rx="1.5" opacity="0.72" />
      <rect x="1340" y="300" width="9" height="12" rx="1.5" opacity="0.6" />
    </g>

    <rect width="1440" height="340" fill="url(#hero-fade)" />
  </svg>
);
