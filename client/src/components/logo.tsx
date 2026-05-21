import Link from "next/link";

type LogoProps = {
  href?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { box: "h-8 w-8", word: "text-base", icon: 22 },
  md: { box: "h-9 w-9", word: "text-lg", icon: 25 },
  lg: { box: "h-12 w-12", word: "text-2xl", icon: 34 },
};

function LogoMark({ size = "md" }: { size?: LogoProps["size"] }) {
  const current = sizes[size ?? "md"];

  return (
    <span
      className={`${current.box} grid shrink-0 place-items-center rounded-xl shadow-lg`}
      style={{
        background:
          "linear-gradient(135deg, rgba(66,212,200,1) 0%, rgba(244,201,93,0.95) 52%, rgba(255,138,91,1) 100%)",
        boxShadow: "0 14px 34px rgba(66,212,200,0.24)",
      }}
      aria-hidden="true"
    >
      <svg
        width={current.icon}
        height={current.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 4.75L33.25 12.2V27.8L20 35.25L6.75 27.8V12.2L20 4.75Z"
          fill="#071312"
          fillOpacity="0.92"
        />
        <path
          d="M14.1 24.95L20 10.5L25.9 24.95H22.65L21.55 22.05H18.32L17.26 24.95H14.1Z"
          fill="white"
        />
        <path d="M16 28.6H26.4" stroke="#42D4C8" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M19.04 19.92H20.85L19.94 17.42L19.04 19.92Z" fill="#42D4C8" />
      </svg>
    </span>
  );
}

export default function Logo({
  href,
  showWordmark = true,
  size = "md",
  className = "",
}: LogoProps) {
  const current = sizes[size];
  const content = (
    <>
      <LogoMark size={size} />
      {showWordmark && (
        <span className={`${current.word} font-extrabold tracking-tight`} style={{ color: "var(--text)" }}>
          Elevoria
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="Elevoria home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
