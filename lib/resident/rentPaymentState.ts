type PaymentLike = {
  id: string;
  amount: number | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  dueDate: Date | string;
  month: string;
};

type TenantLike = {
  moveInDate: Date | string;
  rentAmount: number;
};

export type ResidentRentCycle = {
  paymentId: string | null;
  amount: number;
  dueDate: Date;
  month: string;
  canPayNow: boolean;
};

export type ResidentRentState = {
  nextDueDate: Date | null;
  pendingAmount: number;
  rentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
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
  referenceDate: Date = new Date(),
): ResidentRentState {
  if (!tenant) {
    return {
      nextDueDate: null,
      pendingAmount: 0,
      rentStatus: 'PENDING',
      currentCycle: null,
    };
  }

  const openPayments = payments.filter((payment) =>
    isOpenPayment(payment.status),
  );
  const scheduledPayments = [...openPayments].sort(compareByDueDate);
  const dueNowPayments = scheduledPayments.filter((payment) =>
    isDueDateReached(payment.dueDate, referenceDate),
  );
  const pendingAmount = dueNowPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  if (scheduledPayments.length > 0) {
    const nextScheduledPayment = scheduledPayments[0];
    const nextDueDate = toDate(nextScheduledPayment.dueDate);
    const isPayableNow = isDueDateReached(nextDueDate, referenceDate);
    const isOverdue =
      startOfDay(nextDueDate).getTime() < startOfDay(referenceDate).getTime();
    let rentStatus: ResidentRentState['rentStatus'] = 'PAID';

    if (isOverdue) {
      rentStatus = 'OVERDUE';
    } else if (isPayableNow) {
      rentStatus = 'PENDING';
    }

    return {
      nextDueDate,
      pendingAmount,
      rentStatus,
      currentCycle: {
        paymentId: nextScheduledPayment.id,
        amount: Number(nextScheduledPayment.amount),
        dueDate: nextDueDate,
        month: nextScheduledPayment.month,
        canPayNow: isPayableNow,
      },
    };
  }

  const latestRecordedPayment = [...payments].sort(compareByDueDate).at(-1);
  const nextDueDate = latestRecordedPayment
    ? addOneMonth(latestRecordedPayment.dueDate)
    : toDate(tenant.moveInDate);

  return {
    nextDueDate,
    pendingAmount: 0,
    rentStatus: isDueDateReached(nextDueDate, referenceDate)
      ? 'PENDING'
      : 'PAID',
    currentCycle: {
      paymentId: null,
      amount: Number(tenant.rentAmount),
      dueDate: nextDueDate,
      month: formatPaymentMonth(nextDueDate),
      canPayNow: isDueDateReached(nextDueDate, referenceDate),
    },
  };
}

