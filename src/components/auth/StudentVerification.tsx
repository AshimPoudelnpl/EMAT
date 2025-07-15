import { useState } from 'react';
import { api } from '@/services/apiHelpers';
import { StudentValidationResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, IdCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentVerificationProps {
  onVerificationComplete: (isEligible: boolean, studentData?: StudentValidationResponse) => void;
  isRequired?: boolean;
}

export default function StudentVerification({ 
  onVerificationComplete, 
  isRequired = true 
}: StudentVerificationProps) {
  const [studentId, setStudentId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<StudentValidationResponse | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  const handleValidateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your student ID',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await api.students.validateStudentId(studentId.trim());
      
      if (response.data) {
        setValidationResult(response.data);
        setIsVerified(response.data.is_valid);
        onVerificationComplete(response.data.is_valid, response.data);
        
        if (response.data.is_valid) {
          toast({
            title: 'Student Verified',
            description: `Welcome, ${response.data.student?.full_name}!`,
          });
        } else {
          toast({
            title: 'Verification Failed',
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
        onVerificationComplete(false);
      }
    } catch (error) {
      console.error('Error validating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate student ID',
        variant: 'destructive',
      });
      onVerificationComplete(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setStudentId('');
    setValidationResult(null);
    setIsVerified(false);
    onVerificationComplete(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5" />
          Student Verification
          {isRequired && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isVerified ? (
          <form onSubmit={handleValidateStudent} className="space-y-4">
            <div>
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
                required={isRequired}
                disabled={isValidating}
              />
            </div>
            
            {validationResult && !validationResult.is_valid && (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">{validationResult.message}</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isValidating || !studentId.trim()}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Student ID'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Student Verified</span>
            </div>
            
            {validationResult?.student && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Student ID:</span>{' '}
                  {validationResult.student.student_id}
                </div>
                <div>
                  <span className="font-medium">Name:</span>{' '}
                  {validationResult.student.full_name}
                </div>
                {validationResult.student.program && (
                  <div>
                    <span className="font-medium">Program:</span>{' '}
                    {validationResult.student.program}
                  </div>
                )}
                {validationResult.student.year && (
                  <div>
                    <span className="font-medium">Year:</span>{' '}
                    {validationResult.student.year}
                  </div>
                )}
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="w-full"
            >
              Use Different Student ID
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
