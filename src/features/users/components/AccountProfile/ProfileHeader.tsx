interface ProfileHeaderProps {
  username: string;
  contactInfo: string;
}

export function ProfileHeader({ username, contactInfo }: ProfileHeaderProps) {
  const initial = username.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="flex items-center gap-4 mb-6">
      <span
        className="flex items-center justify-center w-14 h-14 rounded-full text-xl font-extrabold text-white shrink-0 shadow-[0_4px_12px_rgba(0,197,212,0.3)]"
        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        aria-hidden="true"
      >
        {initial}
      </span>
      <div>
        <p className="text-lg font-extrabold text-on-surface">{username}</p>
        <p className="text-sm text-on-surface-muted">{contactInfo}</p>
      </div>
    </div>
  );
}
