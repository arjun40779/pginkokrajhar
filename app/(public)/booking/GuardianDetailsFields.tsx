import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface GuardianDetailsData {
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
}

interface GuardianDetailsFieldsProps {
  data: GuardianDetailsData;
  onChange: (data: Partial<GuardianDetailsData>) => void;
}

export default function GuardianDetailsFields({
  data,
  onChange,
}: Readonly<GuardianDetailsFieldsProps>) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Guardian Details</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="fatherName" className="mb-1">
            Father&apos;s Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fatherName"
            value={data.fatherName}
            onChange={(e) => onChange({ fatherName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="fatherPhone" className="mb-1">
            Father&apos;s Contact No. <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fatherPhone"
            value={data.fatherPhone}
            onChange={(e) => onChange({ fatherPhone: e.target.value })}
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
          <Label htmlFor="motherName" className="mb-1">
            Mother&apos;s Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="motherName"
            value={data.motherName}
            onChange={(e) => onChange({ motherName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="motherPhone" className="mb-1">
            Mother&apos;s Contact No.
          </Label>
          <Input
            id="motherPhone"
            value={data.motherPhone}
            onChange={(e) => onChange({ motherPhone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

