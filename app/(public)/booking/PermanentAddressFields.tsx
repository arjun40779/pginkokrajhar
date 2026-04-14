import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PermanentAddressData {
  village: string;
  postOffice: string;
  pinCode: string;
  district: string;
  addressState: string;
}

interface PermanentAddressFieldsProps {
  data: PermanentAddressData;
  onChange: (data: Partial<PermanentAddressData>) => void;
}

export default function PermanentAddressFields({
  data,
  onChange,
}: Readonly<PermanentAddressFieldsProps>) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Permanent Address</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="village" className="mb-1">
            Village / Town <span className="text-red-500">*</span>
          </Label>
          <Input
            id="village"
            value={data.village}
            onChange={(e) => onChange({ village: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="postOffice" className="mb-1">
            Post Office (P.O.) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postOffice"
            value={data.postOffice}
            onChange={(e) => onChange({ postOffice: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="pinCode" className="mb-1">
            PIN Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="pinCode"
            value={data.pinCode}
            onChange={(e) => onChange({ pinCode: e.target.value })}
            maxLength={6}
            minLength={6}
            pattern="[0-9]{6}"
            title="Please enter a valid 6-digit PIN code"
            placeholder="6-digit PIN"
            required
          />
        </div>
        <div>
          <Label htmlFor="district" className="mb-1">
            District <span className="text-red-500">*</span>
          </Label>
          <Input
            id="district"
            value={data.district}
            onChange={(e) => onChange({ district: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="addressState" className="mb-1">
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addressState"
            value={data.addressState}
            onChange={(e) => onChange({ addressState: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
}

