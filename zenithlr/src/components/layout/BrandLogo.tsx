import Image from "next/image";

export function BrandLogo({
  className = "h-12 w-auto",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "icon";
}) {
  const src = variant === "icon" ? "/logo-icon.png" : "/logo.png";
  return (
    <Image
      src={src}
      alt="Zenith Luxury Realty"
      width={variant === "icon" ? 512 : 660}
      height={variant === "icon" ? 512 : 626}
      className={`object-contain ${className}`}
      priority
    />
  );
}
