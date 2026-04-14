interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  checkInDate: string;
  dateOfBirth: string;
  schoolCollege: string;
  foodType: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  village: string;
  postOffice: string;
  pinCode: string;
  district: string;
  addressState: string;
  declarationAccepted: boolean;
}

export function validateBookingForm(
  formData: BookingFormData,
  hasRules: boolean,
): string | null {
  if (!formData.checkInDate) return 'Please select a check-in date';
  if (!formData.customerName || !formData.customerPhone)
    return 'Please fill in your name and phone number';
  if (!/^\d{10}$/.test(formData.customerPhone))
    return 'Please enter a valid 10-digit phone number';
  if (!formData.customerEmail) return 'Please enter your email address';
  if (!formData.dateOfBirth) return 'Please enter your date of birth';
  if (!formData.schoolCollege)
    return 'Please enter your school or college name';
  if (!formData.foodType) return 'Please select your food preference';
  if (!formData.fatherName || !formData.fatherPhone)
    return "Please fill in father's name and contact number";
  if (!formData.motherName) return "Please fill in mother's name";
  if (
    !formData.village ||
    !formData.postOffice ||
    !formData.pinCode ||
    !formData.district ||
    !formData.addressState
  )
    return 'Please fill in all permanent address fields';
  if (!/^\d{6}$/.test(formData.pinCode))
    return 'Please enter a valid 6-digit PIN code';
  if (hasRules && !formData.declarationAccepted)
    return 'Please accept the rules and regulations to proceed';
  return null;
}

