type PaymentLike = {
  id: string;
  amount: number | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  dueDate: Date | string;
  month: string;
};

type BookingLike = {
  checkInDate: Date | string;
  paidAmount: number | string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
};

type TenantLike = {
  moveInDate: Date | string;
  rentAmount: number;
};

type ResidentRentCycleStatus = 'PENDING' | 'OVERDUE' | 'UPCOMING';
type ResidentRentPeriodStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'UPCOMING';

type CompletedCycle = {
  month: string;
  dueDate: Date;
  amount: number;
};

export type ResidentRentCycle = {
  paymentId: string | null;
  amount: number;
  dueDate: Date;
  month: string;
  canPayNow: boolean;
  status: ResidentRentCycleStatus;
};

export type ResidentRentPeriod = {
  month: string;
  status: ResidentRentPeriodStatus;
  label: string;
};

export type ResidentRentState = {
  nextDueDate: Date | null;
  pendingAmount: number;
  rentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  currentPeriod: ResidentRentPeriod | null;
  currentCycle: ResidentRentCycle | null;
};

function toDate(value: Date | string) {
  return new Date(value);
}

function startOfDay(value: Date | string) {
  const date = toDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function compareByDueDate(left: PaymentLike, right: PaymentLike) {
  return (
    startOfDay(left.dueDate).getTime() - startOfDay(right.dueDate).getTime()
  );
}

function isOpenPayment(status: PaymentLike['status']) {
  return status === 'PENDING' || status === 'FAILED';
}

function isBookingPaid(booking: BookingLike) {
  return (
    (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') &&
    Number(booking.paidAmount) > 0
  );
}

function getCycleStatus(
  dueDate: Date | string,
  referenceDate: Date = new Date(),
): ResidentRentCycleStatus {
  const dueTime = startOfDay(dueDate).getTime();
  const referenceTime = startOfDay(referenceDate).getTime();

  if (dueTime < referenceTime) {
    return 'OVERDUE';
  }

  if (dueTime === referenceTime) {
    return 'PENDING';
  }

  return 'UPCOMING';
}

function getPeriodLabel(status: ResidentRentPeriodStatus) {
  switch (status) {
    case 'PAID':
      return 'Paid';
    case 'PENDING':
      return 'Pending';
    case 'OVERDUE':
      return 'Overdue';
    default:
      return 'Upcoming';
  }
}

export function addOneMonth(value: Date | string) {
  const date = toDate(value);
  date.setMonth(date.getMonth() + 1);
  return date;
}

export function formatPaymentMonth(value: Date | string) {
  return toDate(value).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

export function isDueDateReached(
  dueDate: Date | string,
  referenceDate: Date = new Date(),
) {
  return startOfDay(dueDate).getTime() <= startOfDay(referenceDate).getTime();
}

export function getResidentRentPaymentState(
  tenant: TenantLike | null,
  payments: PaymentLike[],
  bookings: BookingLike[] = [],
  referenceDate: Date = new Date(),
): ResidentRentState {
  if (!tenant) {
    return {
      nextDueDate: null,
      pendingAmount: 0,
      rentStatus: 'PENDING',
      currentPeriod: null,
      currentCycle: null,
    };
  }

  const completedCyclesByMonth = new Map<string, CompletedCycle>();

  payments.forEach((payment) => {
    if (payment.status !== 'COMPLETED') {
      return;
    }

    completedCyclesByMonth.set(payment.month, {
      month: payment.month,
      dueDate: toDate(payment.dueDate),
      amount: Number(payment.amount),
    });
  });

  bookings.forEach((booking) => {
    if (!isBookingPaid(booking)) {
      return;
    }

    const month = formatPaymentMonth(booking.checkInDate);
    completedCyclesByMonth.set(month, {
      month,
      dueDate: toDate(booking.checkInDate),
      amount: Number(booking.paidAmount),
    });
  });

  const completedCycles = [...completedCyclesByMonth.values()].sort(
    compareByDueDate,
  );
  const openPayments = payments
    .filter(
      (payment) =>
        isOpenPayment(payment.status) &&
        !completedCyclesByMonth.has(payment.month),
    )
    .sort(compareByDueDate);
  const nextOpenPayment = openPayments[0];
  const dueNowPayments = openPayments.filter(
    (payment) => getCycleStatus(payment.dueDate, referenceDate) !== 'UPCOMING',
  );
  let pendingAmount = dueNowPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const latestCompletedCycle = completedCycles.at(-1);
  let nextDueDate = toDate(tenant.moveInDate);

  if (nextOpenPayment) {
    nextDueDate = toDate(nextOpenPayment.dueDate);
  } else if (latestCompletedCycle) {
    nextDueDate = addOneMonth(latestCompletedCycle.dueDate);
  }

  const nextCycleStatus = getCycleStatus(nextDueDate, referenceDate);
  const nextCycleMonth = nextOpenPayment
    ? nextOpenPayment.month
    : formatPaymentMonth(nextDueDate);
  const nextCycleAmount = nextOpenPayment
    ? Number(nextOpenPayment.amount)
    : Number(tenant.rentAmount);

  if (!nextOpenPayment && nextCycleStatus !== 'UPCOMING') {
    pendingAmount += nextCycleAmount;
  }

  const currentPeriod =
    latestCompletedCycle && nextCycleStatus === 'UPCOMING'
      ? {
          month: latestCompletedCycle.month,
          status: 'PAID' as const,
          label: getPeriodLabel('PAID'),
        }
      : {
          month: nextCycleMonth,
          status: nextCycleStatus,
          label: getPeriodLabel(nextCycleStatus),
        };

  let rentStatus: ResidentRentState['rentStatus'] = 'PAID';

  if (nextCycleStatus === 'OVERDUE') {
    rentStatus = 'OVERDUE';
  } else if (nextCycleStatus === 'PENDING') {
    rentStatus = 'PENDING';
  }

  return {
    nextDueDate,
    pendingAmount,
    rentStatus,
    currentPeriod,
    currentCycle: {
      paymentId: nextOpenPayment?.id ?? null,
      amount: nextCycleAmount,
      dueDate: nextDueDate,
      month: nextCycleMonth,
      canPayNow: nextCycleStatus === 'PENDING' || nextCycleStatus === 'OVERDUE',
      status: nextCycleStatus,
    },
  };
}

