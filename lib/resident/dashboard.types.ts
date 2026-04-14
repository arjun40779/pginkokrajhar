export type ResidentTenant = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  moveInDate: string;
  moveOutDate: string | null;
  rentAmount: number;
  rentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    monthlyRent: number | string;
    securityDeposit: number | string;
    maxOccupancy: number;
    currentOccupancy: number;
    pg: {
      id: string;
      name: string;
      address: string;
      area: string;
      city: string;
      state: string;
      ownerPhone: string;
    };
  };
};

export type ResidentBooking = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  checkInDate: string;
  checkOutDate: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalAmount: number | string;
  paidAmount: number | string;
  createdAt: string;
  room: ResidentTenant['room'] | null;
};

export type ResidentPayment = {
  id: string;
  amount: number | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDate: string | null;
  dueDate: string;
  month: string;
  createdAt: string;
};

export type ResidentProfile = {
  id: string;
  name: string | null;
  mobile: string;
  email: string | null;
  roles: Array<'ADMIN' | 'TENANT' | 'OWNER'>;
  isActive: boolean;
};

export type ResidentRentPeriod = {
  month: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'UPCOMING';
  label: string;
};

export type ResidentRentCycle = {
  amount: number | string;
  dueDate: string;
  month: string;
  canPayNow: boolean;
  status: 'PENDING' | 'OVERDUE' | 'UPCOMING';
};

export type ResidentDashboardResponse = {
  profile: ResidentProfile | null;
  tenant: ResidentTenant | null;
  bookings: ResidentBooking[];
  payments: ResidentPayment[];
  pendingAmount: number | string;
  nextDueDate: string | number | null;
  monthlyRent?: number | string;
  rentStatus?: 'PAID' | 'PENDING' | 'OVERDUE';
  currentRentPeriod: ResidentRentPeriod | null;
  rentCycle: ResidentRentCycle | null;
};

