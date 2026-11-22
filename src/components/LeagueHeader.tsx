import type { LeagueGroup } from '@/api';

interface Props {
  group: LeagueGroup;
}

export function LeagueHeader({ group }: Props) {
  return (
    <div className="flex items-center gap-2.5 px-1 py-3">
      <img
        src={group.leagueLogo}
        alt=""
        loading="lazy"
        className="h-5 w-5 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {group.flag && (
        <img
          src={group.flag}
          alt=""
          loading="lazy"
          className="h-3.5 w-5 rounded-sm object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <span className="text-sm font-bold text-white">{group.league}</span>
      {group.country && (
        <span className="text-[11px] text-gray-500">{group.country}</span>
      )}
      <span className="mr-auto text-[11px] text-gray-600">
        {group.matches.length} یاری
      </span>
    </div>
  );
}
