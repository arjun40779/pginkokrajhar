import type { StructureResolver } from 'sanity/structure';

// Custom structure for ViralEdits content
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Site Content')
    .items([
      // Page Builder
      S.listItem()
        .title('📄 Page Builder')
        .child(
          S.list()
            .title('Page Builder')
            .items([
              S.documentTypeListItem('pageLayout')
                .title('Pages')
                .child(
                  S.documentTypeList('pageLayout')
                    .title('All Pages')
                    .filter('_type == "pageLayout"')
                    .defaultOrdering([
                      { field: 'isHomepage', direction: 'desc' },
                      { field: 'title', direction: 'asc' },
                    ])
                    .canHandleIntent(
                      (intent, { type }) => type === 'pageLayout',
                    ),
                ),
            ]),
        ),

      S.divider(),

      // Global sections
      S.listItem()
        .title('🌐 Global')
        .child(
          S.list()
            .title('Global')
            .items([
              S.documentTypeListItem('header').title('Header'),
              S.documentTypeListItem('footer').title('Footer'),
            ]),
        ),

      S.divider(),

      // Individual sections (for reference/standalone editing)
      S.listItem()
        .title('📝 Individual Sections')
        .child(
          S.list()
            .title('Individual Sections')
            .items([
              S.documentTypeListItem('hero').title('Hero Sections'),
              S.documentTypeListItem('servicesSection').title(
                'Services Sections',
              ),
              S.documentTypeListItem('ourWorkSection').title(
                'Our Work Sections',
              ),
              S.documentTypeListItem('testimonial').title(
                'Testimonial Sections',
              ),
              S.documentTypeListItem('contactSection').title(
                'Contact Sections',
              ),
            ]),
        ),

      S.divider(),

      // Fallback: any other document types
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return (
          id &&
          ![
            'pageLayout',
            'header',
            'footer',
            'hero',
            'servicesSection',
            'ourWorkSection',
            'testimonial',
            'contactSection',
          ].includes(id)
        );
      }),
    ]);

