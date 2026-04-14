import type { ReactNode } from 'react';
import { Topbar } from '@/shared/components/Topbar';
import { Navbar } from '@/shared/components/Navbar';
import type { CategoryLink } from '@/shared/components/Navbar';
import { Footer } from '@/shared/components/Footer';

interface TiendaLayoutProps {
  children: ReactNode;
  showTopbar?: boolean;
  categoryLinks?: CategoryLink[];
  showFooter?: boolean;
}

export function TiendaLayout({
  children,
  showTopbar = true,
  categoryLinks,
  showFooter = true,
}: TiendaLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-raised font-nunito">
      {/* {showTopbar && <Topbar />} */}
      <Navbar categoryLinks={categoryLinks} />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
