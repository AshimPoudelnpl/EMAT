import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Eye, Vote } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Election } from '@/types';
import { api } from '@/services/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface VoteRecord {
  candidate_id: string;
  voter_id?: string;
  timestamp?: string;
}

export default function ElectionDetailsPage() {
  const [election, setElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchElectionDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await api.elections.getElection(id);
      if (response.data) {
        const electionData = response.data;
        console.log('Election details:', electionData);
        console.log('Election status:', electionData.status);
        console.log('Start time:', electionData.start_time);
        console.log('End time:', electionData.end_time);
        console.log('Current time:', new Date().toISOString());
        
        setElection(electionData);
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

  const fetchVotes = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await api.elections.getVotes(id);
      if (response.data) {
        setVotes(response.data as VoteRecord[]);
      }
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchElectionDetails();
    if (user?.role === 'admin') {
      fetchVotes();
    }
  }, [id, user, fetchElectionDetails, fetchVotes]);

  const handleVote = (candidateId: string) => {
    navigate(`/elections/${id}/vote?candidate=${candidateId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'ended':
        return <Badge className="bg-red-500">Ended</Badge>;
      case 'results_published':
        return <Badge className="bg-blue-500">Results Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isElectionActive = () => {
    if (!election) return false;
    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);
    
    console.log('Checking if election is active:');
    console.log('- Election status:', election.status);
    console.log('- Current time:', now.toISOString());
    console.log('- Start time:', startTime.toISOString());
    console.log('- End time:', endTime.toISOString());
    console.log('- Status is active:', election.status === 'active');
    console.log('- Time is after start:', now >= startTime);
    console.log('- Time is before end:', now <= endTime);
    
    return election.status === 'active' && now >= startTime && now <= endTime;
  };

  const getVotingStatusMessage = () => {
    if (!election) return 'Loading...';
    
    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);
    
    if (election.status !== 'active') {
      return `Election is in "${election.status}" status. Only active elections allow voting.`;
    }
    
    if (now < startTime) {
      return `Voting has not started yet. Voting starts on ${formatDate(election.start_time)}.`;
    }
    
    if (now > endTime) {
      return `Voting has ended. Voting ended on ${formatDate(election.end_time)}.`;
    }
    
    return 'Voting is currently open!';
  };

  const canViewResults = () => {
    return election?.status === 'results_published';
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{election.title}</h1>
          <p className="text-muted-foreground mt-2">{election.description}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(election.status)}
          {canViewResults() && (
            <Button onClick={() => navigate(`/elections/${election._id}/results`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Results
            </Button>
          )}
        </div>
      </div>

      {/* Election Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Start Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatDate(election.start_time)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">End Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatDate(election.end_time)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{election.total_votes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          {user?.role === 'user' && (
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{getVotingStatusMessage()}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {election.candidates.map((candidate) => (
              <div key={candidate._id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={candidate.photo_url} alt={candidate.name} />
                    <AvatarFallback>
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{candidate.name}</h3>
                    {candidate.party && (
                      <p className="text-sm text-muted-foreground">{candidate.party}</p>
                    )}
                    {candidate.position && (
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    )}
                  </div>
                </div>

                {candidate.bio && (
                  <p className="text-sm text-muted-foreground">{candidate.bio}</p>
                )}

                {isElectionActive() && user?.role === 'user' && (
                  <Button
                    onClick={() => handleVote(candidate._id!)}
                    className="w-full"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Vote for {candidate.name}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Only: Votes Section */}
      {user?.role === 'admin' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Votes ({votes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {votes.length === 0 ? (
              <p className="text-muted-foreground">No votes cast yet.</p>
            ) : (
              <div className="space-y-2">
                {votes.map((vote, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span>Vote #{index + 1}</span>
                    <span className="text-sm text-muted-foreground">
                      Candidate ID: {vote.candidate_id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
