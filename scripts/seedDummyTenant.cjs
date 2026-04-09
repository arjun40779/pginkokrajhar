// Seed a dummy tenant with a past booking and pending rent
// Run with: npm run seed:dummy-tenant

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment',
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const password = 'Test@1234';
  const email = `dummy.tenant.${Date.now()}@pginkokrajhar.test`;

  console.log('Creating Supabase auth user:', email);

  const { data: userData, error: userError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (userError || !userData?.user) {
    console.error('Failed to create Supabase user:', userError);
    throw userError || new Error('Unknown error creating Supabase user');
  }

  const authUser = userData.user;

  // Find an available room in any PG
  const room = await prisma.room.findFirst({
    where: {
      isActive: true,
      availabilityStatus: 'AVAILABLE',
    },
  });

  if (!room) {
    throw new Error('No available room found to assign to dummy tenant');
  }

  console.log('Using room for dummy tenant:', room.id, room.roomNumber);

  const now = new Date();
  const moveInDate = new Date(now);
  moveInDate.setMonth(moveInDate.getMonth() - 1); // 1 month in the past

  // Last month as YYYY-MM
  const dueRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthKey = `${dueRef.getFullYear()}-${String(dueRef.getMonth() + 1).padStart(2, '0')}`;

  const monthlyRentNumber = Number(room.monthlyRent ?? 0) || 5000;

  // Create app User linked to Supabase auth user
  const appUser = await prisma.user.create({
    data: {
      id: authUser.id,
      name: 'Dummy Tenant',
      mobile: '9999000000',
      email,
      role: 'TENANT',
      isActive: true,
    },
  });

  // Create Tenant record
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Dummy Tenant',
      phone: '9999000000',
      email,
      occupation: 'Test User',
      moveInDate,
      isActive: true,
      rentAmount: monthlyRentNumber,
      userId: appUser.id,
      roomId: room.id,
    },
  });

  // Create Booking 1 month in the past
  const booking = await prisma.booking.create({
    data: {
      customerName: tenant.name,
      customerPhone: tenant.phone,
      customerEmail: email,
      checkInDate: moveInDate,
      checkOutDate: null,
      status: 'CONFIRMED',
      monthlyRent: room.monthlyRent || monthlyRentNumber,
      securityDeposit: room.securityDeposit || monthlyRentNumber,
      totalAmount: room.monthlyRent || monthlyRentNumber,
      paidAmount: 0,
      pgId: room.pgId,
      roomId: room.id,
      notes: 'Dummy seeded booking for testing',
    },
  });

  // Create pending rent payment for last month
  const payment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      amount: monthlyRentNumber,
      status: 'PENDING',
      paymentDate: null,
      dueDate: dueRef,
      month: monthKey,
      notes: 'Dummy unpaid rent for testing',
    },
  });

  // Update room occupancy
  await prisma.room.update({
    where: { id: room.id },
    data: {
      currentOccupancy: { increment: 1 },
      availabilityStatus: 'OCCUPIED',
    },
  });

  console.log('\n✅ Dummy tenant seeded successfully');
  console.log('Login email :', email);
  console.log('Password    :', password);
  console.log('Tenant ID   :', tenant.id);
  console.log('Room ID     :', room.id);
  console.log('Booking ID  :', booking.id);
  console.log('Payment ID  :', payment.id);
}

main()
  .catch((err) => {
    console.error('Error seeding dummy tenant:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

