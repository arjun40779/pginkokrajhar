# Sanity Hero Section Integration

## ✅ Complete Setup

Your hero section is now fully integrated with Sanity CMS! Here's what has been set up:

### Created Files:

- **Schema**: `sanity/schemaTypes/document/heroSection.ts` - Complete hero section content model
- **Component**: `components/sections/Hero.tsx` - Dynamic hero component
- **Query**: `lib/sanity/queries/heroSection.ts` - Data fetching with TypeScript types
- **Config**: `sanity.config.ts` - Root Studio configuration
- **Sample Data**: `lib/sanity/sampleData/heroSection.ts` - Example content

### Features:

✅ Dynamic badge with icon and text  
✅ Customizable title and subtitle  
✅ Multiple background colors (gradient/solid)  
✅ Flexible CTA buttons with styles  
✅ Statistics section  
✅ Image positioning options  
✅ Responsive design  
✅ SEO-optimized images  
✅ TypeScript support

## 🚀 How to Use

### 1. Start Your Development Server

```bash
npm run dev
```

### 2. Access Sanity Studio

Visit: http://localhost:3000/studio

### 3. Create Hero Content

1. Click "Hero Section" in the Studio
2. Click "Create" to add a new hero section
3. Fill in the fields:
   - **Internal Title**: "Main Homepage Hero"
   - **Badge**: Show badge ✓, Icon: ⭐, Text: "Rated 4.8/5 by 500+ residents"
   - **Main Title**: "Your Perfect Home Away From Home"
   - **Subtitle**: "Comfortable, secure, and affordable PG accommodation..."
   - **Hero Image**: Upload your room image
   - **CTA Buttons**: Add "View Rooms" and "Contact Us" buttons
   - **Stats**: Add your statistics (500+ Happy Residents, etc.)
   - **Background**: Choose "Blue Gradient"
   - **Layout**: Select "Image Right"
   - **Active**: Set to ✅ true

### 4. Publish and View

1. Save your document
2. Visit http://localhost:3000 to see your dynamic hero section!

## 🎨 Customization Options

### Background Colors:

- Blue Gradient (default)
- Purple Gradient
- Green Gradient
- Orange Gradient
- White
- Light Gray

### Layout Options:

- Image Right (default)
- Image Left
- Centered (no side image)

### Button Styles:

- Primary (filled)
- Secondary (gray)
- Outline (border only)

## 🔧 Technical Details

### Data Flow:

1. `app/page.tsx` fetches hero data using `getHeroSection()`
2. Data passed to `components/pages/Home.tsx`
3. Home component renders `components/sections/Hero.tsx`
4. Hero component displays dynamic content or fallback

### Key Features:

- **ISR Caching**: Hero data cached for 1 hour for performance
- **Fallback**: Shows default hero if no Sanity content exists
- **Type Safety**: Full TypeScript support with generated types
- **Image Optimization**: Automatic Sanity image URL generation
- **Responsive**: Optimized for all screen sizes

### File Structure:

```
sanity/
├── config.ts                    # Studio config
├── schemaTypes/
│   ├── index.ts                # Schema exports
│   └── document/
│       └── heroSection.ts      # Hero schema
└── lib/
    └── queries/
        └── heroSection.ts      # Data fetching

components/
└── sections/
    └── Hero.tsx               # Hero component
```

## 🎯 Next Steps

1. **Add More Sections**: Create schemas for other homepage sections
2. **Visual Editing**: Set up Sanity Visual Editing for live preview
3. **Content Migration**: Move other hardcoded content to Sanity
4. **SEO**: Add meta fields to hero schema
5. **A/B Testing**: Create multiple hero versions

Your hero section is now completely dynamic and manageable through Sanity Studio! 🎉
