'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteRoomButtonProps {
  roomId: string;
}

export function DeleteRoomButton({ roomId }: Readonly<DeleteRoomButtonProps>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
        archived?: boolean;
      } | null;

      if (response.ok) {
        setOpen(false);
        router.refresh();
      } else if (response.status === 404) {
        // Room already deleted — just refresh
        setOpen(false);
        router.refresh();
      } else {
        setError(data?.error || 'Failed to delete room');
      }
    } catch (err) {
      console.error('Failed to delete room:', err);
      setError('Failed to delete room');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isDeleting}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete room?</AlertDialogTitle>
          <AlertDialogDescription>
            If this room has active tenants or bookings it will be archived
            instead of fully deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Confirm delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

