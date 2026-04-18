export const PORTRAITS: string[] = [
  'https://i.pravatar.cc/120?img=12',
  'https://i.pravatar.cc/120?img=15',
  'https://i.pravatar.cc/120?img=22',
  'https://i.pravatar.cc/120?img=33',
  'https://i.pravatar.cc/120?img=47',
  'https://i.pravatar.cc/120?img=49',
  'https://i.pravatar.cc/120?img=56',
  'https://i.pravatar.cc/120?img=64',
  'https://i.pravatar.cc/120?img=68',
  'https://i.pravatar.cc/120?img=14',
  'https://i.pravatar.cc/120?img=8',
  'https://i.pravatar.cc/120?img=18',
];

export function portraitFor(seed: string | number): string {
  const idx =
    typeof seed === 'number'
      ? Math.abs(seed) % PORTRAITS.length
      : Math.abs(
          [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0),
        ) % PORTRAITS.length;
  return PORTRAITS[idx]!;
}
