interface BrandNameProps {
  className?: string;
}

export function BrandName({ className = "" }: BrandNameProps) {
  return (
    <span className={className}>
      <span className="brand-belajar">Belajar</span><span className="brand-finance">Finance</span>
    </span>
  );
}