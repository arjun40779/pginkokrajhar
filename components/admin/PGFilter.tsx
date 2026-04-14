'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Building2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface PG {
  id: string;
  name: string;
}

interface PGFilterProps {
  pgs: PG[];
}

export default function PGFilter({ pgs }: Readonly<PGFilterProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPgId = searchParams.get('pgId') || 'all';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('pgId');
    } else {
      params.set('pgId', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-500" />
      <Select value={currentPgId} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by PG" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">All PGs</SelectItem>
          {pgs.map((pg) => (
            <SelectItem key={pg.id} value={pg.id}>
              {pg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

