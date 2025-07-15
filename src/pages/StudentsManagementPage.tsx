import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/apiHelpers';
import { StudentResponse, StudentCreate, BulkStudentCreate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { downloadSampleStudentCSV } from '@/lib/studentUtils';
import { 
  Plus, 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  FileText,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkStudentsText, setBulkStudentsText] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const pageSize = 20;

  // New student form state
  const [newStudent, setNewStudent] = useState<StudentCreate>({
    student_id: '',
    full_name: '',
    email: '',
    program: '',
    year: undefined,
  });

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.students.getAllStudents(
        currentPage * pageSize,
        pageSize,
        searchTerm || undefined
      );
      
      if (response.data) {
        setStudents(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to load students',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, toast]);

  const loadStudentsCount = useCallback(async () => {
    try {
      const response = await api.students.getStudentsCount();
      if (response.data) {
        setTotalStudents(response.data.count);
      }
    } catch (error) {
      console.error('Error loading students count:', error);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/elections');
      return;
    }
    
    loadStudents();
    loadStudentsCount();
  }, [user, navigate, loadStudents, loadStudentsCount]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.student_id || !newStudent.full_name) {
      toast({
        title: 'Error',
        description: 'Student ID and Full Name are required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.students.createStudent(newStudent);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Student created successfully',
        });
        setIsCreateDialogOpen(false);
        setNewStudent({
          student_id: '',
          full_name: '',
          email: '',
          program: '',
          year: undefined,
        });
        loadStudents();
        loadStudentsCount();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create student',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to create student',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkStudentsText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter student data',
        variant: 'destructive',
      });
      return;
    }

    try {
      const lines = bulkStudentsText.trim().split('\n');
      const students: StudentCreate[] = [];
      
      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          students.push({
            student_id: parts[0],
            full_name: parts[1],
            email: parts[2] || undefined,
            program: parts[3] || undefined,
            year: parts[4] ? parseInt(parts[4]) : undefined,
          });
        }
      }

      if (students.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid student data found',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      const response = await api.students.bulkCreateStudents({ students });
      
      if (response.data) {
        toast({
          title: 'Success',
          description: `Created ${response.data.created} students${response.data.errors.length > 0 ? ` (${response.data.errors.length} errors)` : ''}`,
        });
        setIsBulkDialogOpen(false);
        setBulkStudentsText('');
        loadStudents();
        loadStudentsCount();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create students',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error bulk creating students:', error);
      toast({
        title: 'Error',
        description: 'Failed to create students',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.students.uploadStudentsCsv(selectedFile);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: `Uploaded ${response.data.created} students${response.data.errors.length > 0 ? ` (${response.data.errors.length} errors)` : ''}`,
        });
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        loadStudents();
        loadStudentsCount();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to upload students',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading students:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload students',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.students.deleteStudent(studentId);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Student deleted successfully',
        });
        loadStudents();
        loadStudentsCount();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete student',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalStudents / pageSize);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Students Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage student records for election eligibility
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalStudents} students
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div>
                      <Label htmlFor="student_id">Student ID *</Label>
                      <Input
                        id="student_id"
                        value={newStudent.student_id}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, student_id: e.target.value }))}
                        placeholder="Enter student ID"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={newStudent.full_name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="program">Program</Label>
                      <Input
                        id="program"
                        value={newStudent.program}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, program: e.target.value }))}
                        placeholder="Enter program/course"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newStudent.year || ''}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="Enter year"
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Student'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Bulk Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Add Students</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBulkCreate} className="space-y-4">
                    <div>
                      <Label htmlFor="bulk_students">Student Data</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter one student per line in format: StudentID, Full Name, Email, Program, Year
                      </p>
                      <Textarea
                        id="bulk_students"
                        value={bulkStudentsText}
                        onChange={(e) => setBulkStudentsText(e.target.value)}
                        placeholder="ST001, John Doe, john@example.com, Computer Science, 2&#10;ST002, Jane Smith, jane@example.com, Mathematics, 3"
                        rows={10}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBulkDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Students'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Students CSV</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="csv_file">CSV File</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        CSV should have columns: student_id, full_name, email, program, year
                      </p>
                      <Input
                        id="csv_file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        required
                      />
                      <div className="mt-2">
                        <Button 
                          type="button" 
                          variant="link" 
                          size="sm"
                          onClick={downloadSampleStudentCSV}
                          className="p-0 h-auto text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Sample CSV
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading || !selectedFile}>
                        {isLoading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>{student.program || '-'}</TableCell>
                      <TableCell>{student.year || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={student.is_active ? 'default' : 'secondary'}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStudent(student._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalStudents)} of {totalStudents} students
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
