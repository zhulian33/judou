import type { Scene } from "@/lib/types";

type IconProps = {
  className?: string;
};

export function MoonMark({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8 8.7 8.7 0 1 0 20.2 14.6Z"
        fill="currentColor"
      />
      <path
        d="m18.2 4.1.55 1.55L20.3 6.2l-1.55.55-.55 1.55-.55-1.55-1.55-.55 1.55-.55.55-1.55Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrandMark({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9.8 4.6H7.2A4.2 4.2 0 0 0 3 8.8v4.3a4.2 4.2 0 0 0 4.2 4.2H8v2.6l3.4-2.6h.5V4.6H9.8Z"
        fill="currentColor"
      />
      <path
        d="M14.2 4.6h2.6A4.2 4.2 0 0 1 21 8.8v4.3a4.2 4.2 0 0 1-4.2 4.2H16v2.6l-2.8-2.3"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.2c.6 4.1 1.9 5.4 6 6-4.1.6-5.4 1.9-6 6-.6-4.1-1.9-5.4-6-6 4.1-.6 5.4-1.9 6-6Z"
        fill="currentColor"
      />
      <path
        d="M18.7 15.2c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m7 9 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.2 19 6v5.2c0 4.2-2.7 7.7-7 9.6-4.3-1.9-7-5.4-7-9.6V6l7-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v4.2M12 15.7v.1"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16 8V6.2A2.2 2.2 0 0 0 13.8 4H6.2A2.2 2.2 0 0 0 4 6.2v7.6A2.2 2.2 0 0 0 6.2 16H8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3.8"
        y="4.8"
        width="16.4"
        height="14.4"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="9" cy="9.7" r="1.4" fill="currentColor" />
      <path
        d="m5.8 17 4.1-4.2 2.7 2.6 2.3-2.2 3.3 3.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SceneIcon({
  scene,
  className,
}: IconProps & { scene: Scene }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
    className,
  } as const;

  if (scene === "flirt") {
    return (
      <svg {...commonProps}>
        <path
          d="M20.2 8.8c0 4.2-8.2 9.1-8.2 9.1S3.8 13 3.8 8.8A4.2 4.2 0 0 1 12 7.1a4.2 4.2 0 0 1 8.2 1.7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (scene === "work") {
    return (
      <svg {...commonProps}>
        <rect
          x="3.5"
          y="7.4"
          width="17"
          height="12.1"
          rx="2.3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M9 7.4V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.6M3.8 12.2h16.4M10 12.2v1.4h4v-1.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (scene === "family") {
    return (
      <svg {...commonProps}>
        <path
          d="m3.8 11 8.2-7 8.2 7v8.2a1.4 1.4 0 0 1-1.4 1.4H5.2a1.4 1.4 0 0 1-1.4-1.4V11Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.3 20.6v-5.3h5.4v5.3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (scene === "service") {
    return (
      <svg {...commonProps}>
        <path
          d="M5 12a7 7 0 0 1 14 0v4.4a2.4 2.4 0 0 1-2.4 2.4h-2.2M5 12v3.2h2.4v-3.2H5Zm14 0v3.2h-2.4v-3.2H19Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.4 18.8h.1"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="9" cy="9.4" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle
        cx="16.6"
        cy="10.8"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.8 19c.4-3.4 2.5-5.1 5.2-5.1s4.8 1.7 5.2 5.1M14.8 14.5c2.8 0 4.7 1.4 5.3 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
