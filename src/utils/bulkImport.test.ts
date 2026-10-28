import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateEmployeeCsvTemplate,
  parseCsvString,
  validateEmployeeBatch,
  generateSyntheticBatch,
} from './bulkImport';

test('generateEmployeeCsvTemplate returns non-empty CSV with proper headers', () => {
  const template = generateEmployeeCsvTemplate();
  assert.ok(template.includes('nik,fullName,email,phone'));
  assert.ok(template.includes('NC-1001'));
});

test('parseCsvString correctly splits lines and respects quotes', () => {
  const csv = `nik,fullName,email,department
NC-2001,"Pratama, Arya",arya@niceso.co.id,Retail Operations
NC-2002,Budi Santoso,budi@niceso.co.id,IT Systems`;

  const parsed = parseCsvString(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].nik, 'NC-2001');
  assert.equal(parsed[0].fullName, 'Pratama, Arya');
  assert.equal(parsed[1].nik, 'NC-2002');
  assert.equal(parsed[1].fullName, 'Budi Santoso');
});

test('validateEmployeeBatch flags duplicates and validates clean records', () => {
  const existingNiks = new Set(['NC-0001', 'NC-0002']);
  const departments = ['Retail Store Operations', 'IT & Digital Systems'];
  const branches = ['Niceso Ciputat', 'Niceso Head Office'];

  const rawRecords = [
    { nik: 'NC-3001', fullName: 'Dewi Ayu', email: '', department: 'Retail Store Operations', branch: 'Niceso Ciputat' },
    { nik: 'NC-0001', fullName: 'Duplicate Guy', email: 'test@niceso.co.id' }, // Duplicate existing
    { nik: 'NC-3002', fullName: 'Eko Nugroho', email: 'eko@niceso.co.id' },
    { nik: 'NC-3002', fullName: 'Eko Duplicate in Batch', email: 'eko2@niceso.co.id' }, // Duplicate in batch
    { nik: '', fullName: 'No NIK', email: 'nonik@niceso.co.id' }, // Missing NIK
  ];

  const result = validateEmployeeBatch(rawRecords, existingNiks, departments, branches);

  assert.equal(result.validRows.length, 2);
  assert.equal(result.validRows[0].nik, 'NC-3001');
  assert.equal(result.validRows[0].email, 'dewi.ayu@niceso.co.id'); // Auto-generated email
  assert.equal(result.validRows[1].nik, 'NC-3002');

  assert.equal(result.errorRows.length, 3);
  assert.ok(result.duplicateCount >= 2);
});

test('generateSyntheticBatch produces the requested volume of distinct valid rows', () => {
  const batch = generateSyntheticBatch(
    100,
    5000,
    ['Retail Store Operations', 'Supply Chain & Logistik'],
    ['Niceso Ciputat', 'Niceso Margonda']
  );

  assert.equal(batch.length, 100);
  assert.equal(batch[0].nik, 'NC-5000');
  assert.equal(batch[99].nik, 'NC-5099');
  assert.ok(batch[0].fullName.length > 3);
  assert.ok(batch[0].email.includes('@niceso.co.id'));
});
