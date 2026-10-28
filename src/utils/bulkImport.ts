/**
 * Pure business logic for Bulk User / Employee CSV Import & Department Operations
 * Decoupled for fast unit-testing and reliability.
 */

export interface ParsedEmployeeRow {
  nik: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  branch: string;
  employmentType: 'PKWT' | 'PKWTT';
  hireDate: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
}

export interface BatchValidationResult {
  validRows: ParsedEmployeeRow[];
  errorRows: { rowNumber: number; reason: string; raw: Record<string, any> }[];
  duplicateCount: number;
}

/**
 * Returns a standardized CSV template string for Niceso HRIS bulk onboarding.
 */
export function generateEmployeeCsvTemplate(): string {
  const headers = [
    'nik',
    'fullName',
    'email',
    'phone',
    'department',
    'position',
    'branch',
    'employmentType',
    'hireDate',
    'role',
  ].join(',');

  const sampleRows = [
    'NC-1001,Bagus Wibowo,bagus.wibowo@niceso.co.id,0812-1111-2222,Retail Store Operations,Retail Associate,Niceso Ciputat,PKWT,2026-11-01,EMPLOYEE',
    'NC-1002,Fitri Handayani,fitri.h@niceso.co.id,0813-2222-3333,Retail Store Operations,Senior Kasir,Niceso Ciputat,PKWTT,2026-11-01,EMPLOYEE',
    'NC-1003,Doni Setiawan,doni.s@niceso.co.id,0815-3333-4444,Supply Chain & Logistik,Inventory Stockist,Niceso Grand Galaxy,PKWT,2026-11-01,EMPLOYEE',
  ].join('\n');

  return `${headers}\n${sampleRows}`;
}

/**
 * Parses raw CSV string into array of key-value objects.
 * Handles CRLF, basic quotation marks, and trimmed tokens.
 */
export function parseCsvString(csvText: string): Record<string, string>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header
  const headerKeys = lines[0]
    .split(',')
    .map((h) => h.replace(/^["']|["']$/g, '').trim());

  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple regex for CSV splitting while preserving quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentValue = '';

    for (let charIndex = 0; charIndex < rawLine.length; charIndex++) {
      const char = rawLine[charIndex];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const record: Record<string, string> = {};
    headerKeys.forEach((key, index) => {
      let val = values[index] || '';
      val = val.replace(/^["']|["']$/g, '').trim();
      record[key] = val;
    });

    records.push(record);
  }

  return records;
}

/**
 * Validates a batch of parsed employee records against existing database records.
 */
export function validateEmployeeBatch(
  rawRecords: Record<string, any>[],
  existingNiks: Set<string>,
  availableDepartments: string[],
  availableBranches: string[]
): BatchValidationResult {
  const validRows: ParsedEmployeeRow[] = [];
  const errorRows: { rowNumber: number; reason: string; raw: Record<string, any> }[] = [];
  const seenNiksInBatch = new Set<string>();
  let duplicateCount = 0;

  rawRecords.forEach((raw, idx) => {
    const rowNum = idx + 2; // Line 1 is header, so data starts at line 2

    const nik = (raw.nik || raw.NIK || '').trim();
    const fullName = (raw.fullName || raw.nama || raw.Nama || '').trim();
    let email = (raw.email || raw.Email || '').trim();
    const phone = (raw.phone || raw.telepon || raw.No_Telepon || '0812-0000-0000').trim();
    let department = (raw.department || raw.departemen || raw.Departemen || '').trim();
    const position = (raw.position || raw.jabatan || raw.Jabatan || 'Retail Associate').trim();
    let branch = (raw.branch || raw.cabang || raw.Cabang || '').trim();
    const employmentTypeRaw = (raw.employmentType || raw.tipe || 'PKWT').trim().toUpperCase();
    const hireDate = (raw.hireDate || raw.tanggalMasuk || '2026-11-01').trim();
    const roleRaw = (raw.role || 'EMPLOYEE').trim().toUpperCase();

    // 1. Validate NIK
    if (!nik) {
      errorRows.push({ rowNumber: rowNum, reason: 'NIK wajib diisi', raw });
      return;
    }

    if (existingNiks.has(nik) || seenNiksInBatch.has(nik)) {
      duplicateCount++;
      errorRows.push({ rowNumber: rowNum, reason: `NIK ${nik} sudah terdaftar (duplikat)`, raw });
      return;
    }
    seenNiksInBatch.add(nik);

    // 2. Validate FullName
    if (!fullName || fullName.length < 2) {
      errorRows.push({ rowNumber: rowNum, reason: 'Nama lengkap wajib diisi (minimal 2 huruf)', raw });
      return;
    }

    // Auto-generate email if missing
    if (!email) {
      const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
      email = `${cleanName}@niceso.co.id`;
    }

    // Fallback department / branch if not provided or fuzzy match
    if (!department) {
      department = availableDepartments[0] || 'Retail Store Operations';
    } else {
      const matchedDept = availableDepartments.find(
        (d) => d.toLowerCase() === department.toLowerCase()
      );
      if (matchedDept) {
        department = matchedDept;
      }
    }

    if (!branch) {
      branch = availableBranches[0] || 'Niceso Ciputat';
    } else {
      const matchedBranch = availableBranches.find(
        (b) => b.toLowerCase().includes(branch.toLowerCase()) || branch.toLowerCase().includes(b.toLowerCase())
      );
      if (matchedBranch) {
        branch = matchedBranch;
      }
    }

    const employmentType = employmentTypeRaw === 'PKWTT' ? 'PKWTT' : 'PKWT';
    const role =
      roleRaw === 'MANAGER'
        ? 'MANAGER'
        : roleRaw === 'HR_ADMIN'
        ? 'HR_ADMIN'
        : 'EMPLOYEE';

    validRows.push({
      nik,
      fullName,
      email,
      phone,
      department,
      position,
      branch,
      employmentType,
      hireDate,
      role,
    });
  });

  return {
    validRows,
    errorRows,
    duplicateCount,
  };
}

/**
 * Generates mock synthetic employee batch for instant demonstration of 50 - 500+ users.
 */
export function generateSyntheticBatch(
  count: number,
  startNikIndex: number,
  departments: string[],
  branches: string[]
): ParsedEmployeeRow[] {
  const firstNames = [
    'Aditya', 'Bagus', 'Cahyo', 'Dimas', 'Eko', 'Fajar', 'Gilang', 'Hadi', 'Ilham', 'Joko',
    'Kevin', 'Lutfi', 'Muhammad', 'Naufal', 'Oki', 'Pandu', 'Rian', 'Surya', 'Teguh', 'Wahyu',
    'Anisa', 'Bella', 'Citra', 'Dewi', 'Endang', 'Fitri', 'Gita', 'Hesti', 'Indah', 'Kartika',
    'Lestari', 'Maya', 'Nadia', 'Putri', 'Ratna', 'Siti', 'Tri', 'Utami', 'Wulan', 'Yuliana'
  ];

  const lastNames = [
    'Pratama', 'Saputra', 'Kurniawan', 'Wibowo', 'Santoso', 'Hidayat', 'Kusuma', 'Ramadhan',
    'Nugroho', 'Setiawan', 'Firmansyah', 'Permana', 'Hakim', 'Mahendra', 'Gunawan', 'Wijaya',
    'Suryadi', 'Lesmana', 'Siregar', 'Subagyo', 'Anggraini', 'Rahmawati', 'Pertiwi', 'Lestari'
  ];

  const positions = [
    'Retail Associate',
    'Kasir Toko',
    'Visual Merchandiser',
    'Inventory & Stockist',
    'Customer Service Store',
    'Team Leader Shift',
  ];

  const result: ParsedEmployeeRow[] = [];

  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fName} ${lName}`;
    const nikNum = startNikIndex + i;
    const nik = `NC-${String(nikNum).padStart(4, '0')}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i > 40 ? i : ''}@niceso.co.id`;
    const phone = `081${Math.floor(10000000 + Math.random() * 90000000)}`;
    const department = departments[i % departments.length] || 'Retail Store Operations';
    const position = positions[i % positions.length];
    const branch = branches[i % branches.length] || 'Niceso Ciputat';

    result.push({
      nik,
      fullName,
      email,
      phone,
      department,
      position,
      branch,
      employmentType: i % 4 === 0 ? 'PKWTT' : 'PKWT',
      hireDate: '2026-11-01',
      role: 'EMPLOYEE',
    });
  }

  return result;
}
