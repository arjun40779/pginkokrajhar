-- User lookup indexes
CREATE INDEX "users_mobile_idx" ON "users"("mobile");

-- PG lookup and sync indexes
CREATE INDEX "pgs_status_createdAt_idx" ON "pgs"("status", "createdAt");
CREATE INDEX "pgs_sanityDocumentId_idx" ON "pgs"("sanityDocumentId");

-- Room listing and sync indexes
CREATE INDEX "rooms_pgId_isActive_roomNumber_idx" ON "rooms"("pgId", "isActive", "roomNumber");
CREATE INDEX "rooms_pgId_availabilityStatus_monthlyRent_idx" ON "rooms"("pgId", "availabilityStatus", "monthlyRent");
CREATE INDEX "rooms_availabilityStatus_idx" ON "rooms"("availabilityStatus");
CREATE INDEX "rooms_sanityDocumentId_idx" ON "rooms"("sanityDocumentId");

-- Tenant occupancy and listing indexes
CREATE INDEX "tenants_roomId_isActive_idx" ON "tenants"("roomId", "isActive");
CREATE INDEX "tenants_phone_isActive_idx" ON "tenants"("phone", "isActive");
CREATE INDEX "tenants_isActive_createdAt_idx" ON "tenants"("isActive", "createdAt");

-- Booking list and validation indexes
CREATE INDEX "bookings_status_createdAt_idx" ON "bookings"("status", "createdAt");
CREATE INDEX "bookings_pgId_status_createdAt_idx" ON "bookings"("pgId", "status", "createdAt");
CREATE INDEX "bookings_roomId_status_createdAt_idx" ON "bookings"("roomId", "status", "createdAt");
CREATE INDEX "bookings_customerEmail_createdAt_idx" ON "bookings"("customerEmail", "createdAt");

-- Payment timeline and reporting indexes
CREATE INDEX "payments_tenantId_dueDate_idx" ON "payments"("tenantId", "dueDate");
CREATE INDEX "payments_status_paymentDate_idx" ON "payments"("status", "paymentDate");

-- Inquiry list indexes
CREATE INDEX "inquiries_status_createdAt_idx" ON "inquiries"("status", "createdAt");
CREATE INDEX "inquiries_pgId_status_createdAt_idx" ON "inquiries"("pgId", "status", "createdAt");