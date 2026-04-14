import { useState, useEffect, useCallback } from 'react';
import { AccountLayout } from '@/shared/layouts/AccountLayout';
import { ProtectedRoute, useAuth } from '@/features/auth';
import {
  ProfileField,
  ProfileHeader,
  ProfileReadOnlyNotice,
  PhoneVerificationAlert,
  AddPhoneForm,
} from '@/features/users';

export default function PerfilPage() {
  const { user, requestOtp, verifyPhone, addPhone, getOtpStatus } = useAuth();

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // addPhone state
  const [addPhoneLoading, setAddPhoneLoading] = useState(false);
  const [addPhoneError, setAddPhoneError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // Recover OTP state after page refresh
  const checkOtpStatus = useCallback(async () => {
    try {
      const result = await getOtpStatus();
      if (result && result.data.active && result.data.expiresAt) {
        setOtpSent(true);
        setExpiresAt(result.data.expiresAt);
      }
    } catch {
      // Silently ignore — user just won't see the countdown
    }
  }, [getOtpStatus]);

  useEffect(() => {
    if (user && !user.phoneVerified && user.phone && !verified) {
      void checkOtpStatus();
    }
  }, [user?.id, user?.phoneVerified, user?.phone, verified, checkOtpStatus]);

  const handleAddPhone = async (phone: string) => {
    setAddPhoneLoading(true);
    setAddPhoneError(null);
    try {
      const result = await addPhone(phone);
      setPendingPhone(phone);
      // addPhone API sends OTP automatically — transition to code input
      setOtpSent(true);
      const expiry = new Date(Date.now() + result.data.expiresIn * 1000).toISOString();
      setExpiresAt(expiry);
    } catch (err) {
      setAddPhoneError(err instanceof Error ? err.message : 'Error al agregar el telefono');
    } finally {
      setAddPhoneLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!user?.phone) return;
    setOtpLoading(true);
    setOtpError(null);
    setVerifyError(null);
    try {
      const result = await requestOtp(user.phone);
      setOtpSent(true);
      // Calculate expiresAt from expiresIn seconds
      const expiry = new Date(Date.now() + result.data.expiresIn * 1000).toISOString();
      setExpiresAt(expiry);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Error al enviar el codigo');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (!user) return;
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      await verifyPhone({ userId: user.id, code });
      setVerified(true);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Codigo incorrecto');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = () => {
    setOtpSent(false);
    setExpiresAt(null);
    setVerifyError(null);
    setOtpError(null);
    void handleRequestOtp();
  };

  const isVerified = verified || !!user?.phoneVerified;
  const hasPhone = !!user?.phone;
  const showAddPhone = !!user && !hasPhone && !isVerified && !otpSent;
  const showVerificationFlow = !!user && !isVerified && (hasPhone || otpSent);

  return (
    <ProtectedRoute>
      <AccountLayout title="Mi Perfil">
        {user && (
          <ProfileHeader
            username={user.username}
            contactInfo={user.email ?? user.phone ?? 'Sin datos de contacto'}
          />
        )}

        <ProfileReadOnlyNotice />

        {showAddPhone && (
          <AddPhoneForm
            onSubmit={(phone) => void handleAddPhone(phone)}
            isLoading={addPhoneLoading}
            error={addPhoneError}
          />
        )}

        {showVerificationFlow && (
          <PhoneVerificationAlert
            phone={user!.phone ?? pendingPhone ?? ''}
            otpSent={otpSent}
            otpLoading={otpLoading}
            otpError={otpError}
            verifyLoading={verifyLoading}
            verifyError={verifyError}
            verified={false}
            expiresAt={expiresAt}
            onRequestOtp={() => void handleRequestOtp()}
            onVerify={(code) => void handleVerify(code)}
            onResend={handleResend}
          />
        )}

        {isVerified && user?.phone && (
          <PhoneVerificationAlert
            phone={user.phone}
            otpSent={false}
            otpLoading={false}
            otpError={null}
            verifyLoading={false}
            verifyError={null}
            verified={true}
            expiresAt={null}
            onRequestOtp={() => {}}
            onVerify={() => {}}
            onResend={() => {}}
          />
        )}

        <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <div className="px-6 py-4 border-b border-stroke">
            <h2 className="text-sm font-extrabold text-on-surface">Datos personales</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProfileField label="Usuario" value={user?.username ?? '—'} icon="user" />
            <ProfileField label="Telefono" value={user?.phone ?? '—'} icon="phone" />
            <ProfileField label="Email" value={user?.email ?? '—'} icon="email" />
            <ProfileField
              label="Nivel de cliente"
              value={user?.customerRole ?? 'MEMBER'}
              icon="star"
            />
            <ProfileField
              label="Telefono verificado"
              value={isVerified ? 'Si' : 'No'}
              icon="check"
              valueColor={isVerified ? 'text-green-600 dark:text-green-400' : 'text-on-surface-muted'}
            />
          </div>
        </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}
