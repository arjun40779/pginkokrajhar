import type { StructureResolver } from 'sanity/structure';

// Custom structure for PG website content
export const structure: StructureResolver = (S) =>
  S.list()
    .title('PG Website Content')
    .items([
      // Hero Section
      S.listItem()
        .title('🏠 Hero Section')
        .child(
          S.documentTypeList('heroSection')
            .title('Hero Sections')
            .filter('_type == "heroSection"')
            .defaultOrdering([
              { field: 'isActive', direction: 'desc' },
              { field: '_createdAt', direction: 'desc' },
            ]),
        ),

      // Divider
      S.divider(),

      // All Other Documents
      ...S.documentTypeListItems().filter(
        (listItem) => !['heroSection'].includes(listItem.getId() || ''),
      ),
    ]);
