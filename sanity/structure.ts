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
        .title('📋 Room Types')
        .child(
          S.documentTypeList('roomType')
            .title('Room Types')
            .defaultOrdering([{ field: 'sortOrder', direction: 'asc' }]),
        ),

      S.divider(),

      // ── Marketing / Website Content ────────────────────────────
      S.listItem()
        .title('🎨 Marketing Content')
        .child(
          S.list()
            .title('Marketing Content')
            .items([
              S.listItem()
                .title('Hero Sections')
                .child(S.documentTypeList('heroSection').title('Hero Sections')),
              S.listItem()
                .title('Amenities')
                .child(S.documentTypeList('amenitiesSection').title('Amenities')),
              S.listItem()
                .title('Facilities')
                .child(S.documentTypeList('facilitiesSection').title('Facilities')),
              S.listItem()
                .title('Features / CTAs')
                .child(S.documentTypeList('featuresCtaSection').title('Features / CTAs')),
              S.listItem()
                .title('FAQ')
                .child(S.documentTypeList('faqSection').title('FAQ')),
              S.listItem()
                .title('Contact')
                .child(S.documentTypeList('contactSection').title('Contact')),
              S.listItem()
                .title('Contact + Location')
                .child(S.documentTypeList('contactLocationSection').title('Contact + Location')),
            ]),
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

