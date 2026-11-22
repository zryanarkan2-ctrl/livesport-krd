import type { MatchStatus } from '@/types';

interface Props {
  status: MatchStatus;
  minute?: number | null;
}

export function StatusBadge({ status, minute }: Props) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {minute ? `${minute}'` : 'ڕاستەوخۆ'}
      </span>
    );
  }
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-500/10 px-2 py-0.5 text-[11px] font-bold text-gray-400 ring-1 ring-gray-500/15">
        کۆتایی هات
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 ring-1 ring-amber-500/20">
      دەستی پێنەکردووە
    </span>
  );
}
