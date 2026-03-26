import { MapPin } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/Card';
import { ContactLocationSection as ContactLocationType } from '@/sanity/types';

const ContactLocationSection = ({ data }: { data: ContactLocationType }) => {
  const {
    sectionTitle,
    sectionSubtitle,
    mapEmbedUrl,
    address: { addressLine1, addressLine2, addressLine3 },
  } = data;
  return (
    <div className="mt-12">
      <Card>
        <CardHeader>
          <CardTitle>{sectionTitle}</CardTitle>
          <CardDescription>{sectionSubtitle}</CardDescription>
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
              <p className="font-semibold text-gray-900">{addressLine1}</p>
              <p className="text-gray-700">{addressLine2}</p>
              <p className="text-sm text-gray-600 mt-1">{addressLine3}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactLocationSection;

