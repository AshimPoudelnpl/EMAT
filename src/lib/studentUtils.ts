// Utility functions for student management

export const downloadSampleStudentCSV = () => {
  const csvContent = [
    'student_id,full_name,email,program,year',
    'ST001,John Doe,john.doe@university.edu,Computer Science,2',
    'ST002,Jane Smith,jane.smith@university.edu,Mathematics,3',
    'ST003,Mike Johnson,mike.johnson@university.edu,Physics,1',
    'ST004,Sarah Wilson,sarah.wilson@university.edu,Chemistry,4'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = 'student_sample.csv';
  link.click();
  
  window.URL.revokeObjectURL(url);
};

export const validateStudentCSVData = (csvText: string): {
  isValid: boolean;
  errors: string[];
  validRows: number;
  totalRows: number;
} => {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  let validRows = 0;
  let totalRows = 0;

  // Check if file has header
  if (lines.length === 0) {
    return {
      isValid: false,
      errors: ['CSV file is empty'],
      validRows: 0,
      totalRows: 0
    };
  }

  // Skip header row for validation
  const dataLines = lines.slice(1);
  totalRows = dataLines.length;

  dataLines.forEach((line, index) => {
    const rowNumber = index + 2; // +2 because we start from line 2 (after header)
    const columns = line.split(',').map(col => col.trim());

    if (columns.length < 2) {
      errors.push(`Row ${rowNumber}: Missing required columns (student_id and full_name)`);
      return;
    }

    const [studentId, fullName, email, program, year] = columns;

    // Validate required fields
    if (!studentId) {
      errors.push(`Row ${rowNumber}: Student ID is required`);
      return;
    }

    if (!fullName) {
      errors.push(`Row ${rowNumber}: Full name is required`);
      return;
    }

    // Validate email format if provided
    if (email && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
      return;
    }

    // Validate year if provided
    if (year && year !== '' && (isNaN(Number(year)) || Number(year) < 1 || Number(year) > 10)) {
      errors.push(`Row ${rowNumber}: Year must be a number between 1 and 10`);
      return;
    }

    validRows++;
  });

  return {
    isValid: errors.length === 0,
    errors,
    validRows,
    totalRows
  };
};

export const parseStudentCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  const dataLines = lines.slice(1); // Skip header

  return dataLines.map(line => {
    const [studentId, fullName, email, program, year] = line.split(',').map(col => col.trim());
    
    return {
      student_id: studentId,
      full_name: fullName,
      email: email || undefined,
      program: program || undefined,
      year: year && !isNaN(Number(year)) ? Number(year) : undefined,
    };
  }).filter(student => student.student_id && student.full_name); // Filter out invalid rows
};
