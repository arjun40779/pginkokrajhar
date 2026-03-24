export const layoutQuery = `
  *[_type == "layoutSection" && isActive == true][0] {
    _id,
    title,
    isActive,
    siteMetadata {
      siteName,
      siteDescription,
      siteUrl,
      favicon {
        asset->{
          _id,
          url
        },
        alt
      },
      appleTouchIcon {
        asset->{
          _id,
          url
        },
        alt
      },
      ogImage {
        asset->{
          _id,
          url
        },
        alt
      }
    },
    header->{
      _id,
      title,
      isActive,
      brandSection {
        logo {
          asset->{
            _id,
            url
          },
          alt
        },
        companyName,
        homeUrl
      },
      navigation[] {
        label,
        url,
        icon,
      } | order(order asc),
     
    },
    footer->{
      _id,
      title,
      isActive,
      brandSection {
        logo {
          asset->{
            _id,
            url
          },
          alt
        },
        companyName,
        description
      },
      quickLinks {
        title,
        links[] {
          label,
          url,
          openInNewTab,
          order
        } | order(order asc)
      },
      contactInfo {
        title,
        phone,
        email,
        address,
        contactIcons
      },
      copyrightText,
    },
    seo {
      robotsPolicy,
      canonicalUrl,
      structuredData
    },
    analytics {
      googleAnalyticsId,
      googleTagManagerId,
      customHeadScripts,
      customBodyScripts
    },
    performance {
      enablePreload,
      enableServiceWorker,
      cacheStrategy
    }
  }
`;

