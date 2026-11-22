import type { Team } from '@/types';

interface Props {
  team: Team;
  size?: number;
}

export function TeamLogo({ team, size = 32 }: Props) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/[0.03]"
      style={{ width: size, height: size }}
    >
      <img
        src={team.logo}
        alt={team.name}
        loading="lazy"
        className="h-full w-full object-contain p-0.5"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
