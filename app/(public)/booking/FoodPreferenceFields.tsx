import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface FoodPreferenceData {
  foodType: string;
  foodRestrictions: string;
}

interface FoodPreferenceFieldsProps {
  data: FoodPreferenceData;
  onChange: (data: Partial<FoodPreferenceData>) => void;
}

export default function FoodPreferenceFields({
  data,
  onChange,
}: Readonly<FoodPreferenceFieldsProps>) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Food Preference</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-2 block">
            Food Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="foodType"
                value="VEG"
                checked={data.foodType === 'VEG'}
                onChange={(e) => onChange({ foodType: e.target.value })}
                className="h-4 w-4 text-green-600 border-gray-300"
                required
              />
              <span className="text-sm text-gray-700">Veg</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="foodType"
                value="NON_VEG"
                checked={data.foodType === 'NON_VEG'}
                onChange={(e) => onChange({ foodType: e.target.value })}
                className="h-4 w-4 text-red-600 border-gray-300"
              />
              <span className="text-sm text-gray-700">Non-Veg</span>
            </label>
          </div>
        </div>
        <div>
          <Label htmlFor="foodRestrictions" className="mb-1">
            Food you do not consume
          </Label>
          <Input
            id="foodRestrictions"
            value={data.foodRestrictions}
            onChange={(e) => onChange({ foodRestrictions: e.target.value })}
            placeholder="e.g. Beef, Pork, etc."
          />
        </div>
      </div>
    </div>
  );
}

