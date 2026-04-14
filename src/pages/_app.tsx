import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useTheme } from "@/shared/hooks/useTheme";
import { useMaintenanceRedirect } from "@/shared/hooks/useMaintenanceRedirect";
import { useSessionInit, AuthModal } from "@/features/auth";
import { useLikedInit } from "@/features/products";
import { useCartInit, CartDrawer } from "@/features/cart";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { NotificationToast } from "@/shared/components/NotificationToast";
import { FlyToCartDot } from "@/shared/components/FlyToCartDot";
import { WhatsAppFab } from "@/shared/components/WhatsAppFab";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useTheme();
  useMaintenanceRedirect(router);
  useSessionInit();
  useLikedInit();
  useCartInit();

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <AuthModal />
      <CartDrawer />
      <FlyToCartDot />
      <WhatsAppFab />
      <NotificationToast />
    </ErrorBoundary>
  );
}
