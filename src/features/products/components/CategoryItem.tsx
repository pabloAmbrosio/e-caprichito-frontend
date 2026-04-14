import Link from 'next/link';

export interface CategoryItemData {
  label: string;
  href: string;
  image?: string;
  fallbackInitial: string;
}

interface CategoryItemProps extends CategoryItemData {
  size?: 'md' | 'lg';
}

const SIZES = {
  md: { circle: 'w-24 h-24', initial: 'text-[1.75rem]' },
  lg: { circle: 'w-28 h-28', initial: 'text-[2rem]' },
} as const;

export function CategoryItem({ label, href, image, fallbackInitial, size = 'md' }: CategoryItemProps) {
  const s = SIZES[size];

  return (
    <Link
      href={href}
      className="flex flex-col items-center shrink-0 no-underline group outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 rounded-xl"
    >
      <div
        className={`${s.circle} rounded-full mx-auto mb-2.5 shadow-card overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg`}
      >
        {image ? (
          <img
            src={image}
            alt={label}
            className="w-full h-full object-cover border-2 border-stroke/40 rounded-full"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            <span className={`${s.initial} font-extrabold text-white drop-shadow-sm select-none`}>
              {fallbackInitial}
            </span>
          </div>
        )}
      </div>
      <span className="text-xs font-bold text-on-surface text-center max-w-[7rem] truncate">
        {label}
      </span>
    </Link>
  );
}
