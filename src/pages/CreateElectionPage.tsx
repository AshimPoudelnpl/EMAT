import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ElectionCreate, CandidateCreate } from '@/types';
import { api } from '@/services/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload } from 'lucide-react';

interface CandidateForm extends Omit<CandidateCreate, 'photo'> {
  photo: File | null;
}

interface ElectionSettings {
  requireStudentVerification: boolean;
  allowedPrograms?: string[];
  allowedYears?: number[];
}

export default function CreateElectionPage() {
  const [election, setElection] = useState<ElectionCreate>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  
  const [electionSettings, setElectionSettings] = useState<ElectionSettings>({
    requireStudentVerification: true,
    allowedPrograms: [],
    allowedYears: [],
  });
  
  const [candidates, setCandidates] = useState<CandidateForm[]>([
    { name: '', bio: '', party: '', position: '', photo: null }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleElectionChange = (field: keyof ElectionCreate, value: string) => {
    setElection(prev => ({ ...prev, [field]: value }));
  };

  const handleCandidateChange = (index: number, field: keyof CandidateForm, value: string | File | null) => {
    setCandidates(prev =>
      prev.map((candidate, i) =>
        i === index ? { ...candidate, [field]: value } : candidate
      )
    );
  };

  const addCandidate = () => {
    setCandidates(prev => [
      ...prev,
      { name: '', bio: '', party: '', position: '', photo: null }
    ]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted - handleSubmit called');
    
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Error',
        description: 'Only admins can create elections',
        variant: 'destructive',
      });
      return;
    }

    // Validate form
    if (!election.title || !election.start_time || !election.end_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required election fields',
        variant: 'destructive',
      });
      return;
    }

    if (candidates.some(candidate => !candidate.name)) {
      toast({
        title: 'Error',
        description: 'All candidates must have a name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting election creation process...');

    try {
      // Create election first
      console.log('Creating election with data:', election);
      
      // Convert datetime-local values to ISO format for the API
      const electionData = {
        ...election,
        start_time: new Date(election.start_time).toISOString(),
        end_time: new Date(election.end_time).toISOString(),
      };
      
      console.log('Converted election data with ISO timestamps:', electionData);
      
      const electionResponse = await api.elections.createElection(electionData);
      console.log('Election creation response:', electionResponse);
      
      if (!electionResponse.data) {
        console.error('Election creation failed:', electionResponse.error);
        toast({
          title: 'Error',
          description: electionResponse.error || 'Failed to create election',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const createdElection = electionResponse.data;
      console.log('Election created successfully:', createdElection);

      // Activate the election immediately
      console.log('Activating election...');
      const activationResponse = await api.elections.activateElection(createdElection._id);
      if (!activationResponse.data) {
        console.warn('Failed to activate election:', activationResponse.error);
        toast({
          title: 'Warning',
          description: 'Election created but failed to activate. You can activate it manually from the admin dashboard.',
          variant: 'destructive',
        });
      } else {
        console.log('Election activated successfully');
      }

      // Add candidates to the election
      console.log('Adding candidates to election...');
      for (const candidate of candidates) {
        const candidateData: CandidateCreate = {
          name: candidate.name,
          bio: candidate.bio || undefined,
          party: candidate.party || undefined,
          position: candidate.position || undefined,
          photo: candidate.photo || undefined,
        };

        console.log('Adding candidate:', candidateData);
        const candidateResponse = await api.elections.addCandidate(
          createdElection._id,
          candidateData
        );
        console.log('Candidate addition response:', candidateResponse);

        if (!candidateResponse.data) {
          toast({
            title: 'Warning',
            description: `Failed to add candidate ${candidate.name}`,
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Election created successfully',
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error during election creation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create election',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/elections');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Election</h1>
        <p className="text-muted-foreground">Set up a new election with candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Election Details */}
        <Card>
          <CardHeader>
            <CardTitle>Election Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={election.title}
                onChange={(e) => handleElectionChange('title', e.target.value)}
                placeholder="Election title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={election.description}
                onChange={(e) => handleElectionChange('description', e.target.value)}
                placeholder="Election description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={election.start_time}
                  onChange={(e) => handleElectionChange('start_time', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={election.end_time}
                  onChange={(e) => handleElectionChange('end_time', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Verification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Student Verification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requireStudentVerification"
                checked={electionSettings.requireStudentVerification}
                onCheckedChange={(checked) => 
                  setElectionSettings(prev => ({ 
                    ...prev, 
                    requireStudentVerification: checked as boolean 
                  }))
                }
              />
              <Label htmlFor="requireStudentVerification" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Require student ID verification for voting
              </Label>
            </div>
            
            {electionSettings.requireStudentVerification && (
              <div className="ml-6 space-y-3 text-sm text-muted-foreground">
                <p>Only students with verified student IDs in the system will be able to vote in this election.</p>
                <p>Make sure to add eligible students to the system before the election starts.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Candidates</CardTitle>
            <Button type="button" onClick={addCandidate} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {candidates.map((candidate, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium">Candidate {index + 1}</h4>
                  {candidates.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeCandidate(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`candidate-name-${index}`}>Name *</Label>
                    <Input
                      id={`candidate-name-${index}`}
                      value={candidate.name}
                      onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                      placeholder="Candidate name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`candidate-party-${index}`}>Party</Label>
                    <Input
                      id={`candidate-party-${index}`}
                      value={candidate.party}
                      onChange={(e) => handleCandidateChange(index, 'party', e.target.value)}
                      placeholder="Political party"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`candidate-position-${index}`}>Position</Label>
                    <Input
                      id={`candidate-position-${index}`}
                      value={candidate.position}
                      onChange={(e) => handleCandidateChange(index, 'position', e.target.value)}
                      placeholder="Position/Role"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`candidate-photo-${index}`}>Photo</Label>
                    <Input
                      id={`candidate-photo-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleCandidateChange(index, 'photo', file);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`candidate-bio-${index}`}>Biography</Label>
                  <Textarea
                    id={`candidate-bio-${index}`}
                    value={candidate.bio}
                    onChange={(e) => handleCandidateChange(index, 'bio', e.target.value)}
                    placeholder="Candidate biography"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Election'}
          </Button>
        </div>
      </form>
    </div>
  );
}
