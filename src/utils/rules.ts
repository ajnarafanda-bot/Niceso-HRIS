/**
 * Pure Business Logic and Validation Rules for NICESO HRIS
 * Decoupled from UI components for high testability and reliability.
 */

export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  name: string;
  isActive?: boolean;
}

export interface ScheduleRule {
  startTime: string; // '08:30'
  endTime: string;   // '17:30'
  toleranceMinutes: number; // e.g. 15 minutes grace period
  breakMinutes: number;
}

/**
 * Validates work location and geofence parameters.
 */
export function validateWorkLocationConfig(params: {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.name || params.name.trim().length < 3) {
    errors.push('Nama lokasi minimal 3 karakter.');
  }

  if (!params.code || params.code.trim().length < 2) {
    errors.push('Kode lokasi minimal 2 karakter.');
  }

  if (isNaN(params.latitude) || params.latitude < -90 || params.latitude > 90) {
    errors.push('Koordinat Latitude tidak valid (harus antara -90 dan 90).');
  }

  if (isNaN(params.longitude) || params.longitude < -180 || params.longitude > 180) {
    errors.push('Koordinat Longitude tidak valid (harus antara -180 dan 180).');
  }

  if (isNaN(params.radiusMeters) || params.radiusMeters < 10 || params.radiusMeters > 5000) {
    errors.push('Radius absensi harus antara 10 meter hingga 5.000 meter.');
  }

  if (!params.address || params.address.trim().length < 5) {
    errors.push('Alamat lengkap lokasi minimal 5 karakter.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks whether user coordinates are inside branch geofence boundary.
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  branchLat: number,
  branchLng: number,
  radiusMeters: number
): { isInside: boolean; distance: number } {
  const distance = calculateDistanceMeters(userLat, userLng, branchLat, branchLng);
  return {
    isInside: distance <= radiusMeters,
    distance,
  };
}

/**
 * Calculates late arrival minutes considering grace period tolerance.
 * Returns 0 if arrival is on or before (startTime + toleranceMinutes).
 */
export function calculateLateMinutes(
  checkInTimeStr: string, // "HH:mm"
  scheduledStartTimeStr: string, // "HH:mm"
  toleranceMinutes: number = 0
): number {
  const [inHour, inMin] = checkInTimeStr.split(':').map(Number);
  const [schedHour, schedMin] = scheduledStartTimeStr.split(':').map(Number);

  const checkInTotalMin = inHour * 60 + inMin;
  const schedTotalMin = schedHour * 60 + schedMin;
  const allowableTotalMin = schedTotalMin + toleranceMinutes;

  if (checkInTotalMin > allowableTotalMin) {
    return checkInTotalMin - schedTotalMin;
  }
  return 0;
}

/**
 * Validates check-in action against schedule, tolerance, and geofence.
 */
export function validateCheckIn(params: {
  checkInTime: string; // "HH:mm"
  schedule: ScheduleRule;
  userLat?: number;
  userLng?: number;
  branchGeofence?: GeofenceConfig;
  bypassGeofence?: boolean;
}): {
  allowed: boolean;
  isLate: boolean;
  lateMinutes: number;
  status: 'Hadir' | 'Terlambat';
  message: string;
} {
  const { checkInTime, schedule, userLat, userLng, branchGeofence, bypassGeofence } = params;

  // Validate geofence if required and not bypassed
  if (!bypassGeofence && branchGeofence) {
    if (branchGeofence.isActive === false) {
      return {
        allowed: false,
        isLate: false,
        lateMinutes: 0,
        status: 'Hadir',
        message: `Lokasi kerja ${branchGeofence.name} saat ini berstatus Nonaktif. Hubungi HR Admin untuk aktivasi titik lokasi kerja.`,
      };
    }

    if (userLat !== undefined && userLng !== undefined) {
      const { isInside, distance } = isWithinGeofence(
        userLat,
        userLng,
        branchGeofence.latitude,
        branchGeofence.longitude,
        branchGeofence.radiusMeters
      );
      if (!isInside) {
        return {
          allowed: false,
          isLate: false,
          lateMinutes: 0,
          status: 'Hadir',
          message: `Lokasi Anda berada ${distance}m dari ${branchGeofence.name} (Batas radius: ${branchGeofence.radiusMeters}m). Harap mendekat ke area toko/kantor Niceso.`,
        };
      }
    }
  }

  const lateMinutes = calculateLateMinutes(
    checkInTime,
    schedule.startTime,
    schedule.toleranceMinutes
  );
  const isLate = lateMinutes > 0;

  return {
    allowed: true,
    isLate,
    lateMinutes,
    status: isLate ? 'Terlambat' : 'Hadir',
    message: isLate
      ? `Check-in berhasil (Terlambat ${lateMinutes} menit dari jadwal ${schedule.startTime}).`
      : `Check-in berhasil dan tepat waktu (Jadwal: ${schedule.startTime}).`,
  };
}

/**
 * Calculates work duration in minutes between check-in and check-out, deducting break time.
 */
export function calculateWorkDurationMinutes(
  checkInTimeStr: string,
  checkOutTimeStr: string,
  breakMinutes: number = 0
): number {
  const [inHour, inMin] = checkInTimeStr.split(':').map(Number);
  const [outHour, outMin] = checkOutTimeStr.split(':').map(Number);

  let totalMin = outHour * 60 + outMin - (inHour * 60 + inMin);
  // Support night shifts crossing midnight
  if (totalMin < 0) {
    totalMin += 24 * 60;
  }

  // Deduct break only if worked longer than break
  const netDuration = Math.max(0, totalMin - breakMinutes);
  return netDuration;
}

/**
 * Formats duration in minutes to readable Indonesian string: e.g. "8 jam 30 menit"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours === 0) return `${remainingMins} menit`;
  if (remainingMins === 0) return `${hours} jam`;
  return `${hours} jam ${remainingMins} menit`;
}

/**
 * Calculates leave working days between start and end date (inclusive).
 * Optionally excludes weekends and specified national holidays.
 */
export function calculateLeaveWorkingDays(
  startDateStr: string, // "YYYY-MM-DD"
  endDateStr: string,   // "YYYY-MM-DD"
  holidays: string[] = [], // array of "YYYY-MM-DD"
  excludeWeekends: boolean = true
): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) {
    return 0;
  }

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
    const dateFormatted = current.toISOString().split('T')[0];
    const isHoliday = holidays.includes(dateFormatted);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (excludeWeekends) {
      if (!isWeekend && !isHoliday) {
        count++;
      }
    } else {
      if (!isHoliday) {
        count++;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Validates leave balance deduction rules.
 */
export function validateLeaveRequest(params: {
  currentBalance: number;
  requestedDays: number;
  deductsAnnualQuota: boolean;
  minDaysNotice?: number;
}): {
  valid: boolean;
  remainingBalanceAfter: number;
  message: string;
} {
  const { currentBalance, requestedDays, deductsAnnualQuota } = params;

  if (requestedDays <= 0) {
    return {
      valid: false,
      remainingBalanceAfter: currentBalance,
      message: 'Jumlah hari pengajuan cuti minimal 1 hari kerja.',
    };
  }

  if (deductsAnnualQuota) {
    if (requestedDays > currentBalance) {
      return {
        valid: false,
        remainingBalanceAfter: currentBalance,
        message: `Saldo cuti tahunan Anda tidak mencukupi (Tersedia: ${currentBalance} hari, Diajukan: ${requestedDays} hari).`,
      };
    }
    return {
      valid: true,
      remainingBalanceAfter: currentBalance - requestedDays,
      message: `Pengajuan valid. Sisa saldo setelah disetujui akan menjadi ${currentBalance - requestedDays} hari.`,
    };
  }

  // Non-deducting leave (e.g. sick leave with doc note, maternity leave)
  return {
    valid: true,
    remainingBalanceAfter: currentBalance,
    message: 'Pengajuan cuti valid (Jenis cuti ini tidak memotong saldo cuti tahunan).',
  };
}

/**
 * Calculates overtime duration in hours.
 */
export function calculateOvertimeHours(
  startTimeStr: string, // "18:00"
  endTimeStr: string    // "21:30"
): number {
  const [sH, sM] = startTimeStr.split(':').map(Number);
  const [eH, eM] = endTimeStr.split(':').map(Number);

  let diffMinutes = eH * 60 + eM - (sH * 60 + sM);
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Crosses midnight
  }

  const hours = diffMinutes / 60;
  return Math.round(hours * 10) / 10; // 1 decimal place e.g. 3.5
}

/**
 * Formats Indonesian Rupiah (IDR) currency.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a Date object or string to DD-MM-YYYY format.
 */
export function formatDateIndo(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
