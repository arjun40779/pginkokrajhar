import {
  Calendar,
  GraduationCap,
  MapPin,
  Phone,
  User,
  Utensils,
} from 'lucide-react';

interface BookingAdmission {
  dateOfBirth?: string;
  schoolCollege?: string;
  foodType?: string;
  foodRestrictions?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  village?: string;
  postOffice?: string;
  pinCode?: string;
  district?: string;
  addressState?: string;
  declarationAccepted?: boolean;
}

interface AdmissionDetailsProps {
  booking: BookingAdmission;
}

function DetailItem({
  label,
  value,
}: Readonly<{
  label: string;
  value?: string | null;
}>) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

const FOOD_TYPE_LABELS: Record<string, string> = {
  VEG: 'Vegetarian',
  NON_VEG: 'Non-Vegetarian',
};

export default function AdmissionDetails({
  booking,
}: Readonly<AdmissionDetailsProps>) {
  const hasPersonal = booking.dateOfBirth || booking.schoolCollege;
  const hasFood = booking.foodType;
  const hasGuardian = booking.fatherName || booking.motherName;
  const hasAddress =
    booking.village ||
    booking.postOffice ||
    booking.pinCode ||
    booking.district ||
    booking.addressState;

  if (!hasPersonal && !hasFood && !hasGuardian && !hasAddress) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Admission Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasPersonal && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              Personal / Academic
            </h4>
            <dl className="space-y-2">
              {booking.dateOfBirth && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm text-gray-500">Date of Birth</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(booking.dateOfBirth).toLocaleDateString(
                        'en-IN',
                      )}
                    </dd>
                  </div>
                </div>
              )}
              <DetailItem
                label="School / College"
                value={booking.schoolCollege}
              />
            </dl>
          </div>
        )}

        {hasFood && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-gray-400" />
              Food Preference
            </h4>
            <dl className="space-y-2">
              <DetailItem
                label="Food Type"
                value={
                  booking.foodType
                    ? (FOOD_TYPE_LABELS[booking.foodType] ?? booking.foodType)
                    : undefined
                }
              />
              <DetailItem
                label="Restrictions / Allergies"
                value={booking.foodRestrictions}
              />
            </dl>
          </div>
        )}

        {hasGuardian && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Guardian Details
            </h4>
            <dl className="space-y-2">
              <DetailItem label="Father's Name" value={booking.fatherName} />
              {booking.fatherPhone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm text-gray-500">
                      Father&apos;s Phone
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {booking.fatherPhone}
                    </dd>
                  </div>
                </div>
              )}
              <DetailItem label="Mother's Name" value={booking.motherName} />
              {booking.motherPhone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm text-gray-500">
                      Mother&apos;s Phone
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {booking.motherPhone}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        )}

        {hasAddress && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              Permanent Address
            </h4>
            <dl className="space-y-2">
              <DetailItem label="Village / Town" value={booking.village} />
              <DetailItem label="Post Office" value={booking.postOffice} />
              <DetailItem label="PIN Code" value={booking.pinCode} />
              <DetailItem label="District" value={booking.district} />
              <DetailItem label="State" value={booking.addressState} />
            </dl>
          </div>
        )}
      </div>

      {booking.declarationAccepted && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Rules & Regulations declaration accepted
          </span>
        </div>
      )}
    </div>
  );
}

