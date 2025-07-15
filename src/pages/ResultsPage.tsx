import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { Election, ElectionResults } from '@/types';
import { api } from '@/services/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface CandidateResult {
  _id: string;
  name: string;
  party?: string;
  photo_url?: string;
  vote_count: number;
  percentage: number;
}

export default function ResultsPage() {
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchElectionAndResults = useCallback(async () => {
    if (!id) return;
    
    try {
      // Fetch election details
      const electionResponse = await api.elections.getElection(id);
      if (!electionResponse.data) {
        toast({
          title: 'Error',
          description: electionResponse.error || 'Failed to fetch election details',
          variant: 'destructive',
        });
        navigate('/elections');
        return;
      }

      const electionData = electionResponse.data;
      setElection(electionData);

      // Check if results are published
      if (electionData.status !== 'results_published') {
        toast({
          title: 'Results Not Available',
          description: 'Results for this election have not been published yet',
          variant: 'destructive',
        });
        navigate(`/elections/${id}`);
        return;
      }

      // Fetch results
      const resultsResponse = await api.elections.getResults(id);
      if (resultsResponse.data) {
        setResults(resultsResponse.data);
      } else {
        toast({
          title: 'Error',
          description: resultsResponse.error || 'Failed to fetch election results',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load election results',
        variant: 'destructive',
      });
      navigate('/elections');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, navigate]);

  useEffect(() => {
    fetchElectionAndResults();
  }, [fetchElectionAndResults]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading results...</div>
        </div>
      </div>
    );
  }

  if (!election || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Results not available</h2>
          <Button onClick={() => navigate('/elections')} className="mt-4">
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  // Process results data to calculate percentages and sort by votes
  const candidateResults: CandidateResult[] = (results.candidates as unknown as CandidateResult[])
    .map(candidate => ({
      ...candidate,
      percentage: results.total_votes > 0 ? (candidate.vote_count / results.total_votes) * 100 : 0,
    }))
    .sort((a, b) => b.vote_count - a.vote_count);

  const winner = candidateResults[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/elections')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Elections
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Election Results</h1>
          <p className="text-muted-foreground">{election.title}</p>
        </div>
        <Badge className="bg-green-500">Results Published</Badge>
      </div>

      {/* Election Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.total_votes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateResults.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winner</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{winner?.name || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(election.end_time)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Winner Announcement */}
      {winner && (
        <Card className="mb-8 border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Trophy className="h-6 w-6" />
              Election Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={winner.photo_url} alt={winner.name} />
                <AvatarFallback className="text-2xl">
                  {winner.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{winner.name}</h2>
                {winner.party && (
                  <p className="text-lg text-muted-foreground">{winner.party}</p>
                )}
                <div className="mt-2">
                  <span className="text-xl font-semibold">{winner.vote_count} votes</span>
                  <span className="text-muted-foreground ml-2">
                    ({winner.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {candidateResults.map((candidate, index) => (
              <div key={candidate._id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    </div>
                    <Avatar className="h-12 w-12">
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
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{candidate.vote_count}</div>
                    <div className="text-sm text-muted-foreground">
                      {candidate.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={candidate.percentage} 
                  className="h-3"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Election Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Election Information</CardTitle>
        </CardHeader>
        <CardContent>
          {election.description && (
            <p className="text-muted-foreground mb-4">{election.description}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Started:</span> {formatDate(election.start_time)}
            </div>
            <div>
              <span className="font-medium">Ended:</span> {formatDate(election.end_time)}
            </div>
            <div>
              <span className="font-medium">Total Candidates:</span> {candidateResults.length}
            </div>
            <div>
              <span className="font-medium">Total Votes:</span> {results.total_votes}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
