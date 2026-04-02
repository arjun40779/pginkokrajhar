export const pageQuery = `
  *[_type == "pageSection" && slug.current == $slug && isActive == true][0] {
    _id,
    title,
    "slug": slug.current,
    isActive,
    pageMetadata {
      pageTitle,
      pageDescription,
      ogImage,
      "ogImageUrl": ogImage.asset->url,
      customMetaTags
    },
    pageSettings {
      showBreadcrumbs,
      enableComments,
      requireAuth,
      cachePolicy
    },
    "sections": sections[isVisible == true] | order(order asc) {
      sectionType,
      isVisible,
      order,
      customSettings {
        backgroundColor,
        paddingOverride,
        marginOverride
      },
      "sectionData": sectionRef-> {
        _type == "heroSection" => {
          _type,
          _id,
          badge->{
            show,
            icon,
            text
          },
          mainTitle,
          subtitle,
          heroImage {
            asset-> {
              _id,
              url
            },
            alt,
            hotspot,
            crop
          },
          "heroImageUrl": heroImage.asset->url,
          ctaButtons[] {
            text,
            link,
            style,
            size,
            isVisible
          },
          stats[] {
            number,
            label
          },
          backgroundColor
        },
        _type == "amenitiesSection" => {
          _type,
          _id,
          title,
          heading,
          description,
          amenities[] {
            name,
            description,
            icon,
            isHighlighted,
            order
          },
          layout {
            columns,
            spacing,
            showIcons,
            cardStyle,
            backgroundColor
          }
        },
        _type == "facilitiesSection" => {
          _type,
          _id,
          title,
          heading,
          description,
          facilities[] {
            name,
            description,
            image,
            "imageUrl": image.asset->url,
            category,
            order
          },
          layout {
            gridColumns,
            imageRatio,
            showTitles,
            spacing,
            backgroundColor
          }
        },
        _type == "featuresCtaSection" => {
          _type,
          _id,
          title,
          featuresTitle,
          features[] {
            text
          },
          ctaCards[] {
            title,
            description,
            buttonText,
            buttonUrl,
            footerText,
            footerLinkText,
            footerLinkUrl
          },
          layout {
            featuresColumns,
            ctaLayout,
            spacing,
            backgroundColor
          },
          footerLinks[] {
            text,
            link,
            isExternal
          }
        },
        _type == "contactSection" => {
          _type,
          _id,
          title,
          sectionTitle,
          sectionSubtitle,
          contactCards[] {
            type,
            icon,
            title,
            details,
            description
          },
          backgroundColor
        },
        _type == "contactLocationSection" => {
          _type,
          _id,
          title,
          sectionTitle,
          sectionSubtitle,
          address {
            addressLine1,
            addressLine2,
            addressLine3
          },
          mapEmbedUrl,
          backgroundColor
        },
        _type == "faqSection" => {
          _type,
          _id,
          title,
        sectionTitle,
          sectionSubtitle,
          faqItems[] {
            _key,
            question,
            answer
          },
          backgroundColor
        },
        _type == "pgSection" => {
          _type,
          _id,
          title,
          pgName,
          "slug": slug.current,
          description,
          images[] {
            asset-> {
              _id,
              url
            },
            alt,
            caption
          },
          location {
            address,
            area,
            city,
            state,
            pincode,
            nearbyLandmarks,
            coordinates
          },
          contact {
            ownerName,
            phoneNumbers[] {
              number,
              type,
              isWhatsApp
            },
            email
          },
          amenities[] {
            name,
            description,
            icon,
            isAvailable,
            additionalCharges
          },
          availability {
            totalRooms,
            availableRooms,
            lastUpdated
          },
          pricing {
            startingPrice,
            securityDeposit,
            includesElectricity,
            includesWater,
            includesWifi
          },
          featured,
          verificationStatus
        },
        _type == "roomSection" => {
          _type,
          _id,
          title,
          roomNumber,
          "slug": slug.current,
          description,
          pgReference-> {
            _id,
            pgName,
            "slug": slug.current
          },
          images[] {
            asset-> {
              _id,
              url
            },
            alt,
            caption
          },
          roomDetails {
            roomType,
            currentOccupancy,
            maxOccupancy,
            floor,
            roomSize,
            hasBalcony,
            hasAttachedBathroom,
            hasAC,
            hasFan,
            windowDirection
          },
          furniture[] {
            itemName,
            quantity,
            condition,
            description
          },
          pricing {
            monthlyRent,
            securityDeposit,
            maintenanceCharges,
            electricityCharges {
              isIncluded,
              perUnitRate,
              monthlyLimit
            }
          },
          availability {
            status,
            availableFrom,
            lastUpdated
          },
          featured
        }
      }
    }
  }
`;

export const homePageQuery = `
  *[_type == "pageSection" && (slug.current == "home" || slug.current == "" || slug.current == "/") && isActive == true][0] {
    _id,
    title,
    "slug": slug.current,
    isActive,
    pageMetadata {
      pageTitle,
      pageDescription,
      ogImage,
      "ogImageUrl": ogImage.asset->url,
      customMetaTags
    },
    pageSettings {
      showBreadcrumbs,
      enableComments,
      requireAuth,
      cachePolicy
    },
    "sections": sections[isVisible == true] {
      sectionType,
      isVisible,
      customSettings {
        backgroundColor,
        paddingOverride,
        marginOverride
      },
      "sectionData": sectionRef-> {
        _type == "heroSection" => {
          _type,
          _id,
          badge,
          mainTitle,
          subtitle,
          ctaButtons[] {
            text,
            link,
            style,
            size,
            isVisible
          },
          heroImage {
            asset-> {
              _id,
              url
            },
            alt,
            hotspot,
            crop
          },
          "heroImageUrl": heroImage.asset->url,
          stats[] {
            number,
            label
          },
          backgroundColor
        },
        _type == "amenitiesSection" => {
          _type,
          _id,
          sectionTitle,
          sectionSubtitle,
          amenities[] {
            title,
            description,
            icon,
            isHighlighted
          },
          layout {
            columns,
            spacing,
            showIcons,
            cardStyle,
            backgroundColor
          }
        },
        _type == "facilitiesSection" => {
          _type,
          _id,
          title,
          sectionTitle,
          sectionSubtitle,
          description,
          facilities[] {
            title,
            description,
            image,
            "imageUrl": image.asset->url,
            category
          },
          layout {
            gridColumns,
            imageRatio,
            showTitles,
            spacing,
            backgroundColor
          }
        },
        _type == "featuresCtaSection" => {
          _type,
          _id,
          title,
          featuresTitle,
          features[] {
            text
          },
          ctaCards[] {
            title,
            description,
            buttonText,
            buttonUrl,
            footerText,
            footerLinkText,
            footerLinkUrl
          },
          layout {
            featuresColumns,
            ctaLayout,
            spacing,
            backgroundColor
          },
          footerLinks[] {
            text,
            link,
            isExternal
          }
        }
      }
    }
  }
`;

// TypeScript interfaces
export interface HeroSectionData {
  _type: 'heroSection';
  _id: string;
  title: string;
  heading: string;
  subheading?: string;
  ctaButtons: Array<{
    text: string;
    link: string;
    style: string;
    size: string;
    isVisible: boolean;
  }>;
  backgroundImage?: any;
  backgroundImageUrl?: string;
  styling: {
    textAlignment: string;
    backgroundColor: string;
    textColor: string;
    overlayOpacity: number;
    height: string;
  };
}

export interface AmenitiesSectionData {
  _type: 'amenitiesSection';
  _id: string;
  title: string;
  heading: string;
  description?: string;
  amenities: Array<{
    name: string;
    description: string;
    icon: string;
    isHighlighted: boolean;
    order: number;
  }>;
  layout: {
    columns: number;
    spacing: string;
    showIcons: boolean;
    cardStyle: string;
    backgroundColor: string;
  };
}

export interface FacilitiesSectionData {
  _type: 'facilitiesSection';
  _id: string;
  title: string;
  heading: string;
  description?: string;
  facilities: Array<{
    name: string;
    description: string;
    image?: any;
    imageUrl?: string;
    category: string;
    order: number;
  }>;
  layout: {
    gridColumns: number;
    imageRatio: string;
    showTitles: boolean;
    spacing: string;
    backgroundColor: string;
  };
}

export interface FeaturesCtaSectionData {
  _type: 'featuresCtaSection';
  _id: string;
  title: string;
  featuresTitle: string;
  features: Array<{
    text: string;
  }>;
  ctaCards: Array<{
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    footerText?: string;
    footerLinkText?: string;
    footerLinkUrl?: string;
  }>;
  footerLinks?: Array<{
    text: string;
    link: string;
    isExternal: boolean;
  }>;
}

export type SectionData =
  | HeroSectionData
  | AmenitiesSectionData
  | FacilitiesSectionData
  | FeaturesCtaSectionData;

export interface PageSection {
  sectionType: string;
  isVisible: boolean;
  order: number;
  customSettings?: {
    backgroundColor?: string;
    paddingOverride?: string;
    marginOverride?: string;
  };
  sectionData: SectionData;
}

export interface PageData {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  pageMetadata?: {
    pageTitle?: string;
    pageDescription?: string;
    ogImage?: any;
    ogImageUrl?: string;
    customMetaTags?: string;
  };
  pageSettings: {
    showBreadcrumbs: boolean;
    enableComments: boolean;
    requireAuth: boolean;
    cachePolicy: string;
  };
  sections: PageSection[];
}

