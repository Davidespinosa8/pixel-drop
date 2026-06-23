interface IconProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

function base(props: IconProps) {
  return {
    viewBox: "0 0 16 16",
    width: "16",
    height: "16",
    fill: "currentColor",
    "aria-hidden": props["aria-hidden"] ?? ("true" as const),
    "aria-label": props["aria-label"],
    className: props.className,
  };
}

/* Signal — 4 bars of increasing height */
export function SignalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="0"  y="13" width="3" height="3" />
      <rect x="4"  y="10" width="3" height="6" />
      <rect x="8"  y="6"  width="3" height="10" />
      <rect x="12" y="2"  width="3" height="14" />
    </svg>
  );
}

/* Download — arrow pointing down with baseline */
export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="0"  width="2" height="8" />
      <rect x="5" y="6"  width="6" height="2" />
      <rect x="6" y="8"  width="4" height="2" />
      <rect x="7" y="10" width="2" height="2" />
      <rect x="1" y="14" width="14" height="2" />
    </svg>
  );
}

/* Audio — speaker body + 3 sound waves */
export function AudioIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* Speaker body */}
      <rect x="0" y="5"  width="4" height="6" />
      {/* Cone */}
      <rect x="4" y="4"  width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="6" y="2"  width="2" height="12" />
      {/* Wave 1 */}
      <rect x="9"  y="5"  width="1" height="6" />
      {/* Wave 2 */}
      <rect x="11" y="3"  width="1" height="10" />
      {/* Wave 3 */}
      <rect x="13" y="1"  width="1" height="14" />
    </svg>
  );
}

/* Video — screen outline with play triangle */
export function VideoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* Screen outline */}
      <rect x="0"  y="0"  width="16" height="2" />
      <rect x="0"  y="14" width="16" height="2" />
      <rect x="0"  y="2"  width="2"  height="12" />
      <rect x="14" y="2"  width="2"  height="12" />
      {/* Play triangle (stepped) */}
      <rect x="5"  y="4"  width="2" height="8" />
      <rect x="7"  y="5"  width="2" height="6" />
      <rect x="9"  y="6"  width="2" height="4" />
      <rect x="11" y="7"  width="2" height="2" />
    </svg>
  );
}

/* Alert — triangle outline with exclamation */
export function AlertIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* Triangle outline */}
      <rect x="7"  y="0"  width="2" height="2" />
      <rect x="5"  y="2"  width="2" height="2" />
      <rect x="9"  y="2"  width="2" height="2" />
      <rect x="3"  y="4"  width="2" height="2" />
      <rect x="11" y="4"  width="2" height="2" />
      <rect x="1"  y="6"  width="2" height="2" />
      <rect x="13" y="6"  width="2" height="2" />
      <rect x="0"  y="8"  width="16" height="2" />
      {/* Exclamation body */}
      <rect x="7"  y="3"  width="2" height="3" />
      {/* Exclamation dot */}
      <rect x="7"  y="7"  width="2" height="2" />
    </svg>
  );
}

/* Success — checkmark */
export function SuccessIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="1"  y="8"  width="2" height="2" />
      <rect x="3"  y="10" width="2" height="2" />
      <rect x="5"  y="12" width="2" height="2" />
      <rect x="7"  y="10" width="2" height="2" />
      <rect x="9"  y="8"  width="2" height="2" />
      <rect x="11" y="6"  width="2" height="2" />
      <rect x="13" y="4"  width="2" height="2" />
    </svg>
  );
}

/* Close — X mark */
export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="0"  y="0"  width="2" height="2" />
      <rect x="14" y="0"  width="2" height="2" />
      <rect x="2"  y="2"  width="2" height="2" />
      <rect x="12" y="2"  width="2" height="2" />
      <rect x="4"  y="4"  width="2" height="2" />
      <rect x="10" y="4"  width="2" height="2" />
      <rect x="6"  y="6"  width="4" height="4" />
      <rect x="4"  y="10" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="2"  y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
      <rect x="0"  y="14" width="2" height="2" />
      <rect x="14" y="14" width="2" height="2" />
    </svg>
  );
}
