import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PersonalInfoData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  dateOfBirth: string;
  schoolCollege: string;
  checkInDate: string;
}

interface PersonalInfoFieldsProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
}

export default function PersonalInfoFields({
  data,
  onChange,
}: Readonly<PersonalInfoFieldsProps>) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Personal Information
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="customerName" className="mb-1">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerName"
            value={data.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="customerPhone" className="mb-1">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerPhone"
            value={data.customerPhone}
            onChange={(e) => onChange({ customerPhone: e.target.value })}
            pattern="[0-9]{10}"
            maxLength={10}
            title="Please enter a valid 10-digit phone number"
            placeholder="10-digit phone number"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="customerEmail" className="mb-1">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerEmail"
            type="email"
            value={data.customerEmail}
            required
            onChange={(e) => onChange({ customerEmail: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth" className="mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="schoolCollege" className="mb-1">
            School / College Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="schoolCollege"
            value={data.schoolCollege}
            onChange={(e) => onChange({ schoolCollege: e.target.value })}
            placeholder="Name of school or college"
            required
          />
        </div>
        <div>
          <Label htmlFor="checkInDate" className="mb-1">
            Admitted Date / Move-in Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="checkInDate"
            type="date"
            value={data.checkInDate}
            onChange={(e) => onChange({ checkInDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>
    </div>
  );
}

