import { stegaClean } from '@sanity/client/stega';
import { MapPin } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/Card';
import { ContactLocationSection as ContactLocationType } from '@/sanity/types';

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

const ContactLocationSection = ({ data }: { data: ContactLocationType }) => {
  const {
    sectionTitle,
    sectionSubtitle,
    mapEmbedUrl,
    address: { addressLine1, addressLine2, addressLine3 },
  } = data;
  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>{cleanCmsString(sectionTitle)}</CardTitle>
          <CardDescription>{cleanCmsString(sectionSubtitle)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
            {/* Google Maps Embed - Replace with actual coordinates */}
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ComfortStay PG Location"
            ></iframe>
          </div>
          <div className="mt-4 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">
                {cleanCmsString(addressLine1)}
              </p>
              <p className="text-gray-700">{cleanCmsString(addressLine2)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {cleanCmsString(addressLine3)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactLocationSection;

