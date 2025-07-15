import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Vote as VoteIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Election, StudentValidationResponse } from '@/types';
import { api } from '@/services/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StudentVerification from '@/components/auth/StudentVerification';

export default function VotePage() {
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isStudentVerified, setIsStudentVerified] = useState(false);
  const [studentData, setStudentData] = useState<StudentValidationResponse | null>(null);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchElectionDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await api.elections.getElection(id);
      if (response.data) {
        setElection(response.data);
        
        // Check if election is active and user can vote
        const electionData = response.data;
        const now = new Date();
        const startTime = new Date(electionData.start_time);
        const endTime = new Date(electionData.end_time);
        
        if (electionData.status !== 'active') {
          toast({
            title: 'Election Not Active',
            description: 'This election is not currently accepting votes',
            variant: 'destructive',
          });
          navigate(`/elections/${id}`);
          return;
        }
        
        if (now < startTime || now > endTime) {
          toast({
            title: 'Voting Period Ended',
            description: 'The voting period for this election has ended',
            variant: 'destructive',
          });
          navigate(`/elections/${id}`);
          return;
        }
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch election details',
          variant: 'destructive',
        });
        navigate('/elections');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load election details',
        variant: 'destructive',
      });
      navigate('/elections');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'user') {
      toast({
        title: 'Access Denied',
        description: 'Only regular users can vote',
        variant: 'destructive',
      });
      navigate('/elections');
      return;
    }

    if (!id) return;
    
    fetchElectionDetails();
    
    // Pre-select candidate if provided in URL
    const candidateId = searchParams.get('candidate');
    if (candidateId) {
      setSelectedCandidate(candidateId);
    }
  }, [id, user, navigate, searchParams, toast, fetchElectionDetails]);

  const handleVote = async () => {
    if (!id || !selectedCandidate) return;
    
    // Check if student verification is required and completed
    if (!isStudentVerified) {
      toast({
        title: 'Student Verification Required',
        description: 'Please verify your student ID before voting',
        variant: 'destructive',
      });
      return;
    }
    
    setIsVoting(true);
    
    try {
      const response = await api.elections.castVote(id, { candidate_id: selectedCandidate });
      
      if (response.data) {
        toast({
          title: 'Vote Cast Successfully!',
          description: `Thank you for participating in this election, ${studentData?.student?.full_name}!`,
        });
        navigate(`/elections/${id}`);
      } else {
        toast({
          title: 'Voting Failed',
          description: response.error || 'Failed to cast vote',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cast vote',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleStudentVerification = (isEligible: boolean, verificationData?: StudentValidationResponse) => {
    setIsStudentVerified(isEligible);
    setStudentData(verificationData || null);
  };

  if (!user || user.role !== 'user') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Election not found</h2>
          <Button onClick={() => navigate('/elections')} className="mt-4">
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  const selectedCandidateData = election.candidates.find(c => c._id === selectedCandidate);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate(`/elections/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Election
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cast Your Vote</h1>
          <p className="text-muted-foreground">{election.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Verification - Always show first */}
        {!isStudentVerified && (
          <div className="lg:col-span-3">
            <StudentVerification 
              onVerificationComplete={handleStudentVerification}
              isRequired={true}
            />
          </div>
        )}
        
        {/* Only show voting interface after student verification */}
        {isStudentVerified && (
          <>
            {/* Candidate Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Candidate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {election.candidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCandidate === candidate._id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCandidate(candidate._id!)}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={candidate.photo_url} alt={candidate.name} />
                            <AvatarFallback>
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{candidate.name}</h3>
                            {candidate.party && (
                              <p className="text-sm text-muted-foreground">{candidate.party}</p>
                            )}
                            {candidate.position && (
                              <p className="text-sm text-muted-foreground">{candidate.position}</p>
                            )}
                            {candidate.bio && (
                              <p className="text-sm text-muted-foreground mt-2">{candidate.bio}</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 ${
                                selectedCandidate === candidate._id
                                  ? 'border-primary bg-primary'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedCandidate === candidate._id && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vote Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Your Vote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Info Display */}
                  {studentData?.student && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Verified Student</div>
                        <div className="text-green-700">{studentData.student.full_name}</div>
                        <div className="text-green-600">{studentData.student.student_id}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCandidate && selectedCandidateData ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                          <AvatarImage src={selectedCandidateData.photo_url} alt={selectedCandidateData.name} />
                          <AvatarFallback>
                            {selectedCandidateData.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold">{selectedCandidateData.name}</h3>
                        {selectedCandidateData.party && (
                          <p className="text-sm text-muted-foreground">{selectedCandidateData.party}</p>
                        )}
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full" disabled={isVoting || !isStudentVerified}>
                            <VoteIcon className="h-4 w-4 mr-2" />
                            {isVoting ? 'Casting Vote...' : 'Cast Vote'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to vote for <strong>{selectedCandidateData.name}</strong>?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleVote}>
                              Confirm Vote
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <VoteIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select a candidate to vote</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
