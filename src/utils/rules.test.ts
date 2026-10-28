import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceMeters,
  isWithinGeofence,
  calculateLateMinutes,
  validateCheckIn,
  calculateWorkDurationMinutes,
  formatDuration,
  calculateLeaveWorkingDays,
  validateLeaveRequest,
  calculateOvertimeHours,
  formatDateIndo,
  validateWorkLocationConfig,
} from './rules';

test('calculateDistanceMeters computes accurate distance between coordinates', () => {
  // Niceso Ciputat approx coords: -6.3128, 106.7490
  // Point 50 meters away: -6.3132, 106.7490
  const dist = calculateDistanceMeters(-6.3128, 106.7490, -6.3132, 106.7490);
  assert.ok(dist >= 40 && dist <= 55, `Expected ~45-50 meters, got ${dist}`);
});

test('isWithinGeofence validates properly inside and outside radius', () => {
  const branchLat = -6.3128;
  const branchLng = 106.7490;
  const radius = 100; // 100m radius

  // Inside geofence
  const inside = isWithinGeofence(-6.3129, 106.7491, branchLat, branchLng, radius);
  assert.equal(inside.isInside, true);

  // Outside geofence (approx 1.5km away)
  const outside = isWithinGeofence(-6.3250, 106.7550, branchLat, branchLng, radius);
  assert.equal(outside.isInside, false);
});

test('calculateLateMinutes respects schedule and tolerance', () => {
  // Scheduled: 08:30, tolerance 15 min (allowed until 08:45)
  // Check-in at 08:25 (on time)
  assert.equal(calculateLateMinutes('08:25', '08:30', 15), 0);
  // Check-in at 08:40 (within 15m grace)
  assert.equal(calculateLateMinutes('08:40', '08:30', 15), 0);
  // Check-in at 08:50 (late by 20 minutes from 08:30)
  assert.equal(calculateLateMinutes('08:50', '08:30', 15), 20);
});

test('validateCheckIn evaluates schedule and geofence conditions', () => {
  const schedule = {
    startTime: '08:30',
    endTime: '17:30',
    toleranceMinutes: 15,
    breakMinutes: 60,
  };
  const branchGeofence = {
    latitude: -6.3128,
    longitude: 106.7490,
    radiusMeters: 100,
    name: 'Niceso Ciputat',
  };

  // Case 1: Outside geofence without bypass
  const resOutside = validateCheckIn({
    checkInTime: '08:20',
    schedule,
    userLat: -6.3500,
    userLng: 106.7500,
    branchGeofence,
    bypassGeofence: false,
  });
  assert.equal(resOutside.allowed, false);

  // Case 2: Inside geofence and on time
  const resOnTime = validateCheckIn({
    checkInTime: '08:25',
    schedule,
    userLat: -6.3128,
    userLng: 106.7490,
    branchGeofence,
    bypassGeofence: false,
  });
  assert.equal(resOnTime.allowed, true);
  assert.equal(resOnTime.isLate, false);
  assert.equal(resOnTime.status, 'Hadir');

  // Case 3: Inside geofence but late
  const resLate = validateCheckIn({
    checkInTime: '09:05',
    schedule,
    userLat: -6.3128,
    userLng: 106.7490,
    branchGeofence,
    bypassGeofence: false,
  });
  assert.equal(resLate.allowed, true);
  assert.equal(resLate.isLate, true);
  assert.equal(resLate.lateMinutes, 35);
  assert.equal(resLate.status, 'Terlambat');
});

test('calculateWorkDurationMinutes calculates correct working time with break deduction', () => {
  // Check in 08:30, check out 17:30 = 9 hours = 540 min. Deduct 60 min break = 480 min (8 hours)
  const duration = calculateWorkDurationMinutes('08:30', '17:30', 60);
  assert.equal(duration, 480);
  assert.equal(formatDuration(duration), '8 jam');
});

test('calculateLeaveWorkingDays excludes weekends and holidays', () => {
  // Monday 2026-11-02 to Friday 2026-11-06 = 5 working days
  const fiveDays = calculateLeaveWorkingDays('2026-11-02', '2026-11-06', []);
  assert.equal(fiveDays, 5);

  // Monday to following Tuesday with weekend in between (7 calendar days = 5 working days)
  const fullWeek = calculateLeaveWorkingDays('2026-11-02', '2026-11-08', []);
  assert.equal(fullWeek, 5);

  // With a holiday on Wednesday
  const withHoliday = calculateLeaveWorkingDays('2026-11-02', '2026-11-06', ['2026-11-04']);
  assert.equal(withHoliday, 4);
});

test('validateLeaveRequest validates balances and quotas correctly', () => {
  // Sufficient balance
  const validReq = validateLeaveRequest({
    currentBalance: 12,
    requestedDays: 3,
    deductsAnnualQuota: true,
  });
  assert.equal(validReq.valid, true);
  assert.equal(validReq.remainingBalanceAfter, 9);

  // Insufficient balance
  const invalidReq = validateLeaveRequest({
    currentBalance: 2,
    requestedDays: 4,
    deductsAnnualQuota: true,
  });
  assert.equal(invalidReq.valid, false);

  // Non-deducting leave (e.g. sick)
  const sickReq = validateLeaveRequest({
    currentBalance: 2,
    requestedDays: 5,
    deductsAnnualQuota: false,
  });
  assert.equal(sickReq.valid, true);
  assert.equal(sickReq.remainingBalanceAfter, 2);
});

test('calculateOvertimeHours calculates exact overtime with half hours', () => {
  assert.equal(calculateOvertimeHours('17:30', '20:30'), 3.0);
  assert.equal(calculateOvertimeHours('18:00', '21:30'), 3.5);
});

test('formatDateIndo formats correctly to DD-MM-YYYY', () => {
  const formatted = formatDateIndo('2026-11-15T00:00:00Z');
  assert.ok(formatted.includes('15') && formatted.includes('2026'));
});

test('validateWorkLocationConfig validates coordinates, radius, and required fields', () => {
  // Valid store location
  const valid = validateWorkLocationConfig({
    name: 'Niceso Bintaro Jaya',
    code: 'NCS-BTJ',
    latitude: -6.2842,
    longitude: 106.7145,
    radiusMeters: 80,
    address: 'Jl. Boulevard Bintaro Jaya Sektor 7',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);

  // Invalid radius and latitude
  const invalid = validateWorkLocationConfig({
    name: 'Niceso Invalid',
    code: 'X',
    latitude: -120.5, // Out of bounds
    longitude: 106.7,
    radiusMeters: 5, // Below minimum 10m
    address: 'Jl',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((e) => e.includes('Latitude')));
  assert.ok(invalid.errors.some((e) => e.includes('Radius')));
  assert.ok(invalid.errors.some((e) => e.includes('Kode')));
});

test('validateCheckIn rejects attendance when branch is inactive', () => {
  const schedule = {
    startTime: '08:30',
    endTime: '17:30',
    toleranceMinutes: 15,
    breakMinutes: 60,
  };

  const res = validateCheckIn({
    checkInTime: '08:20',
    schedule,
    userLat: -6.3128,
    userLng: 106.7490,
    branchGeofence: {
      latitude: -6.3128,
      longitude: 106.7490,
      radiusMeters: 80,
      name: 'Niceso Bintaro Sektor 7',
      isActive: false, // Inactive branch
    },
    bypassGeofence: false,
  });

  assert.equal(res.allowed, false);
  assert.ok(res.message.includes('Nonaktif'));
});
