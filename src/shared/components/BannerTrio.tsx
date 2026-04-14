import Link from 'next/link';

interface Banner {
  bg: string;
  title: string;
  subtitle: string;
  emoji: string;
  href: string;
}

interface BannerTrioProps {
  banners: Banner[];
}

export function BannerTrio({ banners }: BannerTrioProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mx-8 mb-6">
      {banners.map((b) => (
        <Link
          key={b.href}
          href={b.href}
          className="rounded-xl p-6 min-h-[130px] flex flex-col justify-center relative overflow-hidden no-underline"
          style={{ background: b.bg }}
        >
          <h3 className="font-pacifico text-lg text-white relative z-[1]">{b.title}</h3>
          <p className="text-[11px] text-white/85 font-semibold mt-1 relative z-[1]">{b.subtitle}</p>
          <span className="absolute right-3.5 text-[56px] opacity-30">{b.emoji}</span>
        </Link>
      ))}
    </div>
  );
}
