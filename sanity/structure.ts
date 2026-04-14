import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('PG Website')
    .items([
      // ── PG Management ──────────────────────────────────────────
      S.listItem()
        .title('🏠 PG Properties')
        .child(
          S.documentTypeList('pg')
            .title('PG Properties')
            .defaultOrdering([{ field: 'name', direction: 'asc' }]),
        ),

      S.listItem()
        .title('🛏️ Rooms')
        .child(
          S.documentTypeList('room')
            .title('Rooms')
            .defaultOrdering([{ field: 'roomNumber', direction: 'asc' }]),
        ),

      S.listItem()
        .title('📋 Rules & Regulations')
        .child(
          S.documentTypeList('rulesRegulations').title('Rules & Regulations'),
        ),

      S.listItem()
        .title('⚙️ Site Settings')
        .child(
          S.list()
            .title('Site Settings')
            .items([
              S.listItem()
                .title('Header')
                .child(S.documentTypeList('headerSection').title('Header')),
              S.listItem()
                .title('Footer')
                .child(S.documentTypeList('footerSection').title('Footer')),
              S.listItem()
                .title('Pages')
                .child(S.documentTypeList('pageSection').title('Pages')),
              S.listItem()
                .title('Layouts')
                .child(S.documentTypeList('layoutSection').title('Layouts')),
            ]),
        ),
    ]);

