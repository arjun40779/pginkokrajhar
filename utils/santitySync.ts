// Utility functions for syncing data to Sanity
interface SyncToSanityOptions {
  type: 'pg' | 'room';
  action: 'create' | 'update';
  id: string; // Database ID
}

export async function syncToSanity(options: SyncToSanityOptions) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sync/sanity`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sanity sync failed: ${error.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(
      `Successfully synced ${options.type} ${options.id} to Sanity:`,
      result.sanityDocumentId,
    );
    return result;
  } catch (error) {
    console.error('Error syncing to Sanity:', error);
    // Don't throw - we don't want to fail the main operation if Sanity sync fails
    return null;
  }
}

export async function syncPGToSanity(
  pgId: string,
  action: 'create' | 'update' = 'create',
) {
  return syncToSanity({ type: 'pg', action, id: pgId });
}

export async function syncRoomToSanity(
  roomId: string,
  action: 'create' | 'update' = 'create',
) {
  return syncToSanity({ type: 'room', action, id: roomId });
}
