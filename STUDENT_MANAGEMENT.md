# Student Management System

This document outlines the student management features integrated into the Election Echo Network system.

## Overview

The student management system allows administrators to:
- Manage student records for election eligibility
- Validate student IDs before voting
- Bulk import students via CSV
- Ensure only registered students can vote

## Features

### 1. Student Management Page (`/admin/students`)

**Access**: Admin only

**Features**:
- View all registered students with pagination and search
- Add individual students manually
- Bulk add students via text input (CSV format)
- Upload students from CSV file
- Download sample CSV template
- Delete students
- View student statistics

**Fields per Student**:
- `student_id` (required): Unique student identifier
- `full_name` (required): Student's full name
- `email` (optional): Student's email address
- `program` (optional): Academic program/course
- `year` (optional): Academic year (1-10)
- `is_active` (auto): Whether student is active
- `created_at` (auto): Registration timestamp

### 2. Student ID Validator (`/admin/student-validator`)

**Access**: Admin only

**Features**:
- Test student ID validation in real-time
- View validation history
- Check student eligibility status
- Debug voting issues

### 3. Voting with Student Verification

**Access**: Regular users only

**Features**:
- Student ID verification required before voting
- Real-time validation against registered students
- Only verified students can cast votes
- Student information displayed during voting process

### 4. Election Creation with Student Settings

**Access**: Admin only

**Features**:
- Enable/disable student verification per election
- Configure election-specific eligibility rules
- Preview student verification requirements

## API Integration

### Student Management Endpoints

All endpoints are prefixed with `/api/v1/students/`

#### 1. Create Student
```
POST /api/v1/students/
```
Create a single student record.

#### 2. Get All Students
```
GET /api/v1/students/?skip=0&limit=100&search=query
```
Retrieve students with pagination and search.

#### 3. Bulk Create Students
```
POST /api/v1/students/bulk
```
Create multiple students at once.

#### 4. Upload Students CSV
```
POST /api/v1/students/upload-csv
```
Upload students from CSV file.

#### 5. Get Students Count
```
GET /api/v1/students/count
```
Get total number of registered students.

#### 6. Get Student by ID
```
GET /api/v1/students/{student_id}
```
Retrieve specific student details.

#### 7. Update Student
```
PUT /api/v1/students/{student_id}
```
Update student information.

#### 8. Delete Student
```
DELETE /api/v1/students/{student_id}
```
Remove student from system.

#### 9. Validate Student ID
```
GET /api/v1/students/validate/{student_id}
```
Check if student ID is valid and active.

## CSV Format

### Sample CSV Structure
```csv
student_id,full_name,email,program,year
ST001,John Doe,john.doe@university.edu,Computer Science,2
ST002,Jane Smith,jane.smith@university.edu,Mathematics,3
ST003,Mike Johnson,mike.johnson@university.edu,Physics,1
```

### CSV Validation Rules
- `student_id`: Required, must be unique
- `full_name`: Required, non-empty string
- `email`: Optional, must be valid email format if provided
- `program`: Optional, any string
- `year`: Optional, must be number between 1-10 if provided

## Usage Workflow

### 1. Setting Up Students
1. Navigate to Admin Dashboard
2. Click "Manage Students"
3. Add students via:
   - Individual form entry
   - Bulk text input (CSV format)
   - CSV file upload

### 2. Creating Elections with Student Verification
1. Navigate to "Create Election"
2. Fill in election details
3. Enable "Require student ID verification"
4. Save election

### 3. Student Voting Process
1. Student navigates to election voting page
2. System prompts for student ID verification
3. Student enters their ID
4. System validates against registered students
5. If valid, voting interface is displayed
6. Student selects candidate and casts vote

### 4. Validating Students (Testing)
1. Navigate to "Validate Student IDs"
2. Enter student ID to test
3. View validation result and student details
4. Check recent search history

## Error Handling

### Common Validation Errors
- **Student ID not found**: Student not registered in system
- **Student inactive**: Student account is disabled
- **Invalid email format**: Email doesn't match required pattern
- **Duplicate student ID**: Student ID already exists in system
- **Missing required fields**: Student ID or name not provided

### CSV Upload Errors
- **Invalid file format**: File is not a valid CSV
- **Missing headers**: CSV doesn't have required column headers
- **Row validation errors**: Individual rows fail validation
- **Duplicate entries**: Multiple students with same ID in upload

## Security Features

### Access Control
- Student management: Admin only
- Student validation: Admin only
- Student ID verification: Required for voting
- API endpoints: Authenticated requests only

### Data Validation
- Server-side validation for all student data
- Client-side validation for better UX
- SQL injection prevention
- Input sanitization

## Integration Points

### Frontend Components
- `StudentsManagementPage`: Main admin interface
- `StudentValidatorPage`: ID validation tool
- `StudentVerification`: Voting verification component
- `CreateElectionPage`: Enhanced with student settings

### Backend APIs
- Student CRUD operations
- Bulk import functionality
- Validation endpoints
- Search and pagination

### Database Schema
- Students collection/table
- Indexes on student_id for fast lookups
- Foreign key relationships with votes
- Audit trails for student changes

## Best Practices

### For Administrators
1. Import students before election starts
2. Test student validation before going live
3. Use CSV upload for large datasets
4. Regularly backup student data
5. Monitor student registration statistics

### For Developers
1. Always validate student data on both client and server
2. Use pagination for large student lists
3. Implement proper error handling
4. Cache validation results where appropriate
5. Log all student-related operations

## Troubleshooting

### Common Issues
1. **Student can't vote**: Check if student ID is registered and active
2. **CSV upload fails**: Verify CSV format and data validation
3. **Validation errors**: Use student validator tool to debug
4. **Performance issues**: Check database indexes and pagination

### Debug Steps
1. Use Student Validator to test specific IDs
2. Check admin dashboard for student count
3. Verify election settings for student verification
4. Review API logs for validation errors

## Future Enhancements

### Planned Features
- Student photo upload and verification
- Bulk student status updates
- Student group management
- Advanced filtering and sorting
- Student activity reports
- Integration with university systems

### API Improvements
- Batch validation endpoints
- Advanced search capabilities
- Student analytics endpoints
- Webhook notifications for changes
