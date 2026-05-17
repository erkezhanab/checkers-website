export function CheckersLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g transform="rotate(45 50 50)">
        {/* Board outline */}
        <rect x="20" y="20" width="60" height="60" rx="6" fill="white" stroke="#374151" strokeWidth="2.5"/>

        {/* Dark cells — 4×4 checkerboard, cell size 15 */}
        {/* Row 0 */}
        <rect x="35" y="20" width="15" height="15" rx="2" fill="#374151"/>
        <rect x="65" y="20" width="15" height="15" rx="2" fill="#374151"/>
        {/* Row 1 */}
        <rect x="20" y="35" width="15" height="15" rx="2" fill="#374151"/>
        <rect x="50" y="35" width="15" height="15" rx="2" fill="#374151"/>
        {/* Row 2 */}
        <rect x="35" y="50" width="15" height="15" rx="2" fill="#374151"/>
        <rect x="65" y="50" width="15" height="15" rx="2" fill="#374151"/>
        {/* Row 3 */}
        <rect x="20" y="65" width="15" height="15" rx="2" fill="#374151"/>
        <rect x="50" y="65" width="15" height="15" rx="2" fill="#374151"/>

        {/* Pieces (white circles) on selected dark cells */}
        <circle cx="27.5" cy="42.5" r="5.5" fill="white"/>
        <circle cx="42.5" cy="57.5" r="5.5" fill="white"/>
        <circle cx="27.5" cy="72.5" r="5.5" fill="white"/>
        <circle cx="57.5" cy="72.5" r="5.5" fill="white"/>
      </g>
    </svg>
  );
}
