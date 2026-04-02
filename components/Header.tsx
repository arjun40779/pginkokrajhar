'use client';
import { stegaClean } from '@sanity/client/stega';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  Phone,
  Menu,
  X,
  UserCircle,
  Building,
  Hotel,
  MapPin,
  Star,
  Mail,
  Calendar,
  Settings,
  Info,
  CreditCard,
  MoreHorizontal,
  Grid3X3,
  XCircle,
  Minus,
} from 'lucide-react';
import { HeaderSection } from '@/sanity/types';

interface HeaderProps {
  headerData?: HeaderSection | null;
}

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

const Header: React.FC<HeaderProps> = ({ headerData }) => {
  const pathname = usePathname();

  // Icon mapping for dynamic icons
  const iconMap: Record<string, React.ElementType> = {
    Home,
    Building2,
    Building,
    Phone,
    UserCircle,
    Hotel,
    MapPin,
    Star,
    Mail,
    Calendar,
    Settings,
    Info,
    CreditCard,
    Menu,
    X,
    MoreHorizontal,
    Grid3X3,
    XCircle,
    Minus,
  };

  // Use Sanity data or fallback
  const data = headerData;

  // Find contact item for mobile top-right placement
  const contactItem = data?.navigation?.find(
    (item) =>
      cleanCmsString(item.url).toLowerCase().includes('/contact') ||
      cleanCmsString(item.label).toLowerCase().includes('contact'),
  );

  // Filter out contact item from bottom navigation
  const bottomNavItems = data?.navigation
    ?.filter(
      (item) =>
        !cleanCmsString(item.url).toLowerCase().includes('/contact') &&
        !cleanCmsString(item.label).toLowerCase().includes('contact'),
    )
    .slice(0, 4); // Limit to 4 items to keep layout balanced

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                ComfortStay PG
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {data?.navigation?.map((item) => {
                const itemIcon = cleanCmsString(item.icon);
                const itemUrl = cleanCmsString(item.url) || '/';
                const itemLabel = cleanCmsString(item.label);
                const Icon = iconMap[itemIcon] || MoreHorizontal;
                const isActive = pathname === itemUrl;

                return (
                  <Link
                    key={`${itemUrl}-${itemLabel}`}
                    href={itemUrl}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{itemLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Contact Button - Top Right */}
            {contactItem && (
              <div className="md:hidden">
                <Link
                  href={cleanCmsString(contactItem.url) || '/contact'}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 border-2 shadow-sm ${
                    pathname === cleanCmsString(contactItem.url)
                      ? 'text-white bg-blue-600 border-blue-600 shadow-md'
                      : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 active:scale-95'
                  }`}
                >
                  {(() => {
                    const Icon =
                      iconMap[cleanCmsString(contactItem.icon)] ||
                      MoreHorizontal;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  <span className="text-sm font-medium">
                    {cleanCmsString(contactItem.label)}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex h-16">
          {bottomNavItems?.map((item) => {
            const itemIcon = cleanCmsString(item.icon);
            const itemUrl = cleanCmsString(item.url) || '/';
            const itemLabel = cleanCmsString(item.label);
            const Icon = iconMap[itemIcon] || MoreHorizontal;
            const isActive = pathname === itemUrl;

            return (
              <Link
                key={`${itemUrl}-${itemLabel}`}
                href={itemUrl}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                <span
                  className={`text-xs mt-1 text-center leading-tight ${isActive ? 'font-medium' : 'font-normal'}`}
                >
                  {itemLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Header;

