import { Home } from '@/components/pages/Home';
import { getHeroSection } from '@/lib/sanity/queries/heroSection';

export default async function Page() {
  // Fetch hero section data from Sanity
  const heroData = await getHeroSection();
  console.log('Fetched hero section data:', heroData);

  return <Home heroData={heroData} />;
}

