import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/apiHelpers';
import { StudentValidationResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  IdCard, 
  ArrowLeft,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StudentValidatorPage() {
  const [studentId, setStudentId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<StudentValidationResponse[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleValidateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a student ID',
        variant: 'destructive',
      });
      return;
    }

    const searchId = studentId.trim();
    setIsValidating(true);

    try {
      const response = await api.students.validateStudentId(searchId);
      
      if (response.data) {
        setValidationResults(prev => [response.data!, ...prev.slice(0, 4)]); // Keep last 5 results
        setSearchHistory(prev => [searchId, ...prev.filter(id => id !== searchId).slice(0, 9)]); // Keep last 10 unique searches
        
        if (response.data.is_valid) {
          toast({
            title: 'Student Found',
            description: `${response.data.student?.full_name} is eligible to vote`,
          });
        } else {
          toast({
            title: 'Student Not Found',
            description: response.data.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to validate student ID',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate student ID',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearResults = () => {
    setValidationResults([]);
    setSearchHistory([]);
  };

  if (!user || user.role !== 'admin') {
    navigate('/elections');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IdCard className="h-8 w-8" />
            Student ID Validator
          </h1>
          <p className="text-muted-foreground mt-2">
            Test student ID validation and check eligibility
          </p>
        </div>
      </div>

      {/* Validation Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Validate Student ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleValidateStudent} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID to validate"
                  disabled={isValidating}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={isValidating || !studentId.trim()}
                  className="flex items-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Validate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Recent searches:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchHistory.map((id, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setStudentId(id)}
                    className="text-xs"
                  >
                    {id}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Validation Results</CardTitle>
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.is_valid 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {result.is_valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">
                          {result.is_valid ? 'Valid Student' : 'Invalid Student'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    <Badge variant={result.is_valid ? 'default' : 'destructive'}>
                      {result.is_valid ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </div>

                  {result.student && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Student ID:</span>
                          <div>{result.student.student_id}</div>
                        </div>
                        <div>
                          <span className="font-medium">Name:</span>
                          <div>{result.student.full_name}</div>
                        </div>
                        {result.student.program && (
                          <div>
                            <span className="font-medium">Program:</span>
                            <div>{result.student.program}</div>
                          </div>
                        )}
                        {result.student.year && (
                          <div>
                            <span className="font-medium">Year:</span>
                            <div>{result.student.year}</div>
                          </div>
                        )}
                        {result.student.email && (
                          <div>
                            <span className="font-medium">Email:</span>
                            <div className="break-all">{result.student.email}</div>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Status:</span>
                          <div>
                            <Badge variant={result.student.is_active ? 'default' : 'secondary'}>
                              {result.student.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
