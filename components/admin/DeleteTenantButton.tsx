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

interface DeleteTenantButtonProps {
  tenantId: string;
}

export function DeleteTenantButton({
  tenantId,
}: Readonly<DeleteTenantButtonProps>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;

      if (response.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data?.error || 'Failed to delete tenant');
      }
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      setError('Failed to delete tenant');
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
          <AlertDialogTitle>Delete tenant?</AlertDialogTitle>
          <AlertDialogDescription>
            This action may deactivate the tenant instead of fully deleting them
            if they have payment history. This cannot be easily undone.
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

