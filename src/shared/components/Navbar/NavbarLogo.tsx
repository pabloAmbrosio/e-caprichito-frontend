import Link from 'next/link';

interface NavbarLogoProps {
  title: string;
  subtitle: string;
}

export function NavbarLogo({ title, subtitle }: NavbarLogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${title} ${subtitle} - Ir al inicio`}
      className="group shrink-0 no-underline rounded-lg focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none transition-transform duration-200 hover:scale-[1.02]"
    >
      <span
        className="font-pacifico text-xl lg:text-[1.375rem] block leading-tight bg-clip-text text-transparent"
        style={{ backgroundImage: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
      >
        {title}
      </span>
      <span className="font-nunito text-[0.5625rem] font-black uppercase tracking-widest text-orange transition-colors duration-300 group-hover:text-turquoise">
        {subtitle}
      </span>
    </Link>
  );
}
