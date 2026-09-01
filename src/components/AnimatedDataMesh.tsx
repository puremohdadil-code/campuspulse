import { useReducedMotion } from "framer-motion";

export default function AnimatedDataMesh({ variant = "auth" }: { variant?: "auth" | "hero" }) {
  const reduceMotion = useReducedMotion();
  return ( 
    <div className={`campus-data-mesh campus-data-mesh--${variant}`} aria-hidden="true">
      <svg viewBox="0 0 1000 760" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`mesh-gradient-${variant}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d5a64c" stopOpacity="0" />
            <stop offset=".28" stopColor="#d5a64c" stopOpacity=".8" />
            <stop offset=".68" stopColor="#67a5b6" stopOpacity=".72" />
            <stop offset="1" stopColor="#67a5b6" stopOpacity="0" />
          </linearGradient>
          <filter id={`mesh-glow-${variant}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className="mesh-tracks" fill="none" stroke={`url(#mesh-gradient-${variant})`}>
          <path className="mesh-line mesh-line--one" d="M-80 505 C130 410 230 620 430 465 S760 330 1080 410" />
          <path className="mesh-line mesh-line--two" d="M-90 610 C170 525 270 685 505 530 S790 485 1090 550" />
          <path className="mesh-line mesh-line--three" d="M-60 670 C185 600 375 735 590 620 S820 575 1080 645" />
          <path className="mesh-line mesh-line--four" d="M90 545 C260 480 320 530 465 500 S680 385 910 440" />
        </g>

        <g className="mesh-stations" fill="none">
          <circle cx="195" cy="491" r="12" />
          <circle cx="430" cy="465" r="9" />
          <circle cx="690" cy="387" r="7" />
          <circle cx="505" cy="530" r="11" />
          <circle cx="790" cy="501" r="8" />
        </g>

        <g className="mesh-travellers" filter={`url(#mesh-glow-${variant})`}>
          <circle r="5">{!reduceMotion ? <animateMotion dur="7.5s" repeatCount="indefinite" path="M-80 505 C130 410 230 620 430 465 S760 330 1080 410" /> : null}</circle>
          <circle r="4">{!reduceMotion ? <animateMotion dur="10.5s" begin="-3s" repeatCount="indefinite" path="M-90 610 C170 525 270 685 505 530 S790 485 1090 550" /> : null}</circle>
          <circle r="3.5">{!reduceMotion ? <animateMotion dur="13s" begin="-7s" repeatCount="indefinite" path="M-60 670 C185 600 375 735 590 620 S820 575 1080 645" /> : null}</circle>
        </g>
      </svg>
      <span className="mesh-signal mesh-signal--one"><i />01</span>
      <span className="mesh-signal mesh-signal--two"><i />AI</span>
      <span className="mesh-signal mesh-signal--three"><i />24</span>
    </div>
  );
}
