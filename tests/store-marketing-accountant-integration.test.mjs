import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Store contact and both booking types feed the Marketing inbox contracts", () => {
  const contactRepository = read(
    "../../AnhEmMotor-Store/app/core/infrastructure/repositories/contact.repository.js",
  );
  const bookingRepository = read(
    "../../AnhEmMotor-Store/app/core/infrastructure/repositories/booking.repository.js",
  );
  const testDrivePage = read("../../AnhEmMotor-Store/app/pages/test-drive.vue");
  const serviceBookingPage = read(
    "../../AnhEmMotor-Store/app/pages/service-booking.vue",
  );
  const bookingTypes = read(
    "../../AnhEmMotor-Backend/Domain/Constants/Booking/BookingType.cs",
  );
  const bookingHandler = read(
    "../../AnhEmMotor-Backend/Application/Features/Bookings/Commands/CreateBooking/CreateBookingCommandHandler.cs",
  );
  const marketingBooking = read(
    "../src/modules/Marketing/view/customer/booking/index.vue",
  );
  const contactApi = read("../src/api/customer/contact.api.ts");
  const contactStore = read("../src/application/store/contact.ts");
  const contactManagement = read(
    "../src/modules/Marketing/view/contact/index.vue",
  );

  assert.match(contactRepository, /\/api\/v1\/Contacts\/support-request/);
  assert.match(contactRepository, /resolveContactCategory/);
  assert.match(bookingRepository, /\/api\/v1\/Bookings/);
  assert.match(testDrivePage, /bookingType:\s*"TestDrive"/);
  assert.match(serviceBookingPage, /bookingType:\s*"Maintenance"/);
  assert.match(bookingTypes, /Maintenance\s*=\s*"Maintenance"/);
  assert.match(bookingHandler, /GetBookingTypeLabel/);
  assert.match(marketingBooking, /const bookingKpis = computed/);
  assert.match(marketingBooking, /value:\s*"Maintenance"/);
  assert.match(contactApi, /items:\s*Contact\.ContactItem\[\]/);
  assert.match(contactApi, /pageNumber:\s*number/);
  assert.match(contactStore, /ContactApi\.assign/);
  assert.match(contactStore, /markAsProcessed:\s*true/);
  assert.doesNotMatch(contactStore, /isInternal:\s*false/);
  assert.doesNotMatch(contactStore, /\(Local\)/);
  assert.doesNotMatch(contactStore, /Date\.now\(\)/);
  assert.match(contactManagement, /fetchGetUserList/);
  assert.match(
    contactManagement,
    /contactStore\.activeItem\.contactId,\s*replyDraft\.value/,
  );
  assert.doesNotMatch(contactManagement, /Nguyễn Văn A|Trần Thị B|Lê Văn C/);
});

test("Employee KPI status is derived from configured targets without fabricated fallbacks", () => {
  const analyticsRepository = read(
    "../../AnhEmMotor-Backend/Infrastructure/Repositories/AnalyticsRepository.cs",
  );
  const analyticsTypes = read("../src/services/analytics.types.ts");
  const employeeReport = read(
    "../src/modules/Accountant/view/reporting/employee.vue",
  );

  assert.doesNotMatch(
    analyticsRepository,
    /TargetSales\s*=\s*targetSales\s*>\s*0\s*\?\s*targetSales\s*:\s*s\.Sales/,
  );
  assert.doesNotMatch(analyticsRepository, /s\.Sales\s*>\s*100000000/);
  assert.doesNotMatch(
    analyticsRepository,
    /CommissionPaid\s*=\s*commissionPaid\s*>\s*0/,
  );
  assert.match(analyticsRepository, /k\.PeriodStart\s*<=\s*end/);
  assert.match(analyticsRepository, /k\.PeriodEnd\s*>=\s*start/);
  assert.match(analyticsTypes, /Chưa đặt KPI/);
  assert.match(employeeReport, /withoutKpiCount/);
});

test("Accountant dashboard period filters reload real KPI data and use reporting surfaces", () => {
  const dashboard = read(
    "../src/modules/Accountant/view/reporting/dashboard.vue",
  );

  assert.match(
    dashboard,
    /getDashboardOverview\(\s*periodStart\.value,\s*periodEnd\.value\s*,?\s*\)/,
  );
  assert.doesNotMatch(dashboard, /const onPeriodChange = \(\) => \{\};/);
  assert.match(dashboard, /class="reporting-kpi-grid/);
  assert.match(dashboard, /class="reporting-card/);
  assert.match(dashboard, /useSettingStore/);
});
