import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { FAQSection as FAQSectionType } from '@/sanity/types';

interface FAQSectionProps {
  data: FAQSectionType;
}

const FAQSection = ({ data }: FAQSectionProps) => {
  const { sectionTitle, sectionSubtitle, faqItems } = data;

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {faqItems?.map((faq) => (
          <Card key={faq._key}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;

