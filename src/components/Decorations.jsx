import React from "react";

/* Icon Rồng – cách điệu */
export function DragonIcon({ size = 28, color = "#eab308", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 16c2 4 6 8 12 8s10-4 12-8c-1 6-5 12-12 14-7-2-11-8-12-14zm12 2a2 2 0 110-4 2 2 0 010 4z"
        fill={color}
        opacity="0.95"
      />
      <path
        d="M8 10c2-2 4-2 6 0l2 4-2 2-4-2-2-4zM24 10c-2-2-4-2-6 0l-2 4 2 2 4-2 2-4z"
        fill={color}
        opacity="0.8"
      />
      <path d="M16 4l2 6-2 2-2-2 2-6z" fill={color} />
    </svg>
  );
}

/* Icon Lân – cách điệu (đầu lân) */
export function LionIcon({ size = 28, color = "#eab308", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <ellipse cx="16" cy="18" rx="10" ry="10" fill={color} opacity="0.9" />
      <circle cx="12" cy="16" r="2" fill="#1a1510" />
      <circle cx="20" cy="16" r="2" fill="#1a1510" />
      <path d="M14 22c1 1 2 1 4 0" stroke="#1a1510" strokeWidth="1.2" fill="none" />
      <path d="M8 14l-2-4 2-2 2 2-2 4zM24 14l2-4-2-2-2 2 2 4z" fill={color} opacity="0.85" />
      <path d="M16 8l-1 4h2l-1-4z" fill={color} />
    </svg>
  );
}

/* Icon Sư tử – cách điệu */
export function TigerIcon({ size = 28, color = "#eab308", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="9" fill={color} opacity="0.9" stroke={color} strokeWidth="1" />
      <circle cx="12" cy="15" r="1.5" fill="#1a1510" />
      <circle cx="20" cy="15" r="1.5" fill="#1a1510" />
      <path d="M14 21c1.5 0.5 2.5 0.5 4 0" stroke="#1a1510" strokeWidth="1" fill="none" />
      <path d="M16 10v3M13 12h6" stroke="#1a1510" strokeWidth="1" />
    </svg>
  );
}

/* Màu hoa đào hồng Tết */
export const PEACH_BLOSSOM_PINK = "#e879a0";
export const PEACH_BLOSSOM_PINK_DARK = "#db2777";

/* Hoa đào – 5 cánh (mặc định hồng, có thể truyền color vàng) */
export function PeachBlossomIcon({ size = 24, color = PEACH_BLOSSOM_PINK, className = "" }) {
  const r = 8;
  const cx = 16;
  const cy = 16;
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });
  const d = petals
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ") + " Z";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {petals.map((_, i) => {
        const a = (i * 72 * Math.PI) / 180;
        const x = cx + 10 * Math.cos(a);
        const y = cy + 10 * Math.sin(a);
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="5"
            ry="8"
            fill={color}
            opacity="0.95"
            transform={`rotate(${i * 72} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill={color === PEACH_BLOSSOM_PINK || color === PEACH_BLOSSOM_PINK_DARK ? "#c41e3a" : "#c41e3a"} opacity="0.9" />
    </svg>
  );
}

/* Đèn lồng Tết */
export function LanternIcon({ size = 24, color = "#eab308", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2L14 8h-4L12 2zM4 10h16v14c0 2-2 4-4 4H8c-2 0-4-2-4-4V10z"
        fill={color}
        opacity="0.95"
      />
      <path d="M12 14v8M9 16h6M8 22h8" stroke="#1a1510" strokeWidth="0.8" fill="none" opacity="0.6" />
      <rect x="10" y="24" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    </svg>
  );
}

/* Mây cách điệu */
export function CloudIcon({ size = 32, color = "rgba(234,179,8,0.4)", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <ellipse cx="12" cy="14" rx="10" ry="6" fill={color} />
      <ellipse cx="24" cy="12" rx="12" ry="7" fill={color} />
      <ellipse cx="36" cy="14" rx="10" ry="6" fill={color} />
    </svg>
  );
}

/* Dải trang trí lặp (vàng) – giữ cho tương thích */
export function DecorativeStrip({ height = 12, className = "" }) {
  return (
    <div
      className={className}
      style={{
        height,
        width: "100%",
        background: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 20px,
          rgba(212,160,18,0.25) 20px,
          rgba(212,160,18,0.25) 22px
        )`,
        borderTop: "1px solid rgba(212,160,18,0.5)",
        borderBottom: "1px solid rgba(212,160,18,0.5)",
      }}
      aria-hidden
    />
  );
}

/* Dải Tết: nhiều hoa đào hồng + đèn lồng + rồng */
export function FestivalStrip({ iconSize = 28, className = "" }) {
  const items = [];
  const sequence = ["flower", "lantern", "dragon", "flower", "lantern", "dragon", "flower", "lantern"];
  for (let i = 0; i < 24; i++) {
    const type = sequence[i % sequence.length];
    items.push({ key: i, type });
  }
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0.25rem 0.75rem",
        padding: "0.5rem 1rem",
        background: "linear-gradient(90deg, rgba(20,20,20,0.95) 0%, rgba(26,10,20,0.98) 50%, rgba(20,20,20,0.95) 100%)",
        borderTop: "2px solid rgba(212,160,18,0.4)",
        borderBottom: "2px solid rgba(232,121,160,0.35)",
        minHeight: 48,
      }}
      aria-hidden
    >
      {items.map(({ key, type }) => (
        <span key={key} style={{ display: "inline-flex", alignItems: "center" }}>
          {type === "flower" && <PeachBlossomIcon size={iconSize} color={PEACH_BLOSSOM_PINK} />}
          {type === "lantern" && <LanternIcon size={iconSize} color="#eab308" />}
          {type === "dragon" && <DragonIcon size={iconSize} color="#eab308" />}
        </span>
      ))}
    </div>
  );
}

/* Viền góc trang trí (góc vàng) */
export function CornerOrnament({ position = "top-left", size = 24 }) {
  const style = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: "rgba(212,160,18,0.6)",
    borderStyle: "solid",
    borderWidth: "2px 2px 0 0",
  };
  if (position === "top-right") {
    style.top = 0;
    style.right = 0;
    style.borderWidth = "2px 0 0 2px";
  } else if (position === "bottom-left") {
    style.bottom = 0;
    style.left = 0;
    style.borderWidth = "0 2px 2px 0";
  } else if (position === "bottom-right") {
    style.bottom = 0;
    style.right = 0;
    style.borderWidth = "0 0 2px 2px";
  } else {
    style.top = 0;
    style.left = 0;
  }
  return <div style={style} aria-hidden />;
}

/* Tiêu đề có icon hai bên (nhiều hoa đào hồng + rồng + lân) */
export function DecorativeTitle({ children, showIcons = true, iconSize = 22, className = "" }) {
  if (!showIcons) return <span className={className}>{children}</span>;
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem 0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
      <PeachBlossomIcon size={iconSize} color={PEACH_BLOSSOM_PINK} />
      <PeachBlossomIcon size={iconSize - 2} color={PEACH_BLOSSOM_PINK} />
      <DragonIcon size={iconSize + 4} />
      <DragonIcon size={iconSize + 2} />
      <span>{children}</span>
      <DragonIcon size={iconSize + 2} />
      <DragonIcon size={iconSize + 4} />
      <PeachBlossomIcon size={iconSize - 2} color={PEACH_BLOSSOM_PINK} />
      <PeachBlossomIcon size={iconSize} color={PEACH_BLOSSOM_PINK} />
      <LionIcon size={iconSize + 4} />
    </span>
  );
}

export default {
  DragonIcon,
  LionIcon,
  TigerIcon,
  PeachBlossomIcon,
  LanternIcon,
  CloudIcon,
  DecorativeStrip,
  FestivalStrip,
  CornerOrnament,
  DecorativeTitle,
  PEACH_BLOSSOM_PINK,
};
