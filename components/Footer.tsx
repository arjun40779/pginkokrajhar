import { stegaClean } from '@sanity/client/stega';
import { FooterSection } from '@/sanity/types';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
  footerData?: FooterSection | null;
}

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

const Footer: React.FC<FooterProps> = ({ footerData }) => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">
                {footerData?.brandSection?.companyName || 'ComfortStay PG'}
              </span>
            </div>
            <p className="text-gray-400">
              {footerData?.brandSection?.description}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">
              {footerData?.quickLinks?.title}
            </h3>
            <ul className="space-y-2">
              {footerData?.quickLinks?.links?.map((link) => {
                const linkLabel = link?.label;
                const linkUrl = cleanCmsString(link?.url) || '/';

                return (
                  <li key={`${linkLabel}-${linkUrl}`}>
                    <Link
                      href={linkUrl}
                      className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {linkLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">
              {footerData?.contactInfo?.title}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>📞 {footerData?.contactInfo?.phone}</li>
              <li>📧 {footerData?.contactInfo?.email}</li>
              <li>📍 {footerData?.contactInfo?.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{footerData?.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

