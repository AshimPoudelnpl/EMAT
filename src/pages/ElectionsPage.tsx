import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Vote, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Election } from '@/types';
import { api } from '@/services/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchElections = useCallback(async () => {
    try {
      const response = await api.elections.getAllElections();
      if (response.data) {
        setElections(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch elections',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load elections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const getStatusBadge = (election: Election) => {
    switch (election.status) {
      case 'active':
        return <Badge className="bg-election-active text-white">Active</Badge>;
      case 'draft':
        return <Badge className="bg-election-pending text-white">Draft</Badge>;
      case 'ended':
        return <Badge className="bg-election-ended text-white">Ended</Badge>;
      case 'results_published':
        return <Badge className="bg-green-600 text-white">Results Published</Badge>;
      default:
        return <Badge variant="secondary">{election.status}</Badge>;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Vote className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Elections</h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'admin' 
                ? 'Manage and monitor all elections' 
                : 'Participate in democratic decision making'}
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <Button 
              variant="election" 
              onClick={() => navigate('/admin/create-election')}
            >
              Create Election
            </Button>
          )}
        </div>

        {elections.length === 0 ? (
          <div className="text-center py-16">
            <Vote className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No elections available
            </h3>
            <p className="text-muted-foreground mb-6">
              {user?.role === 'admin' 
                ? 'Create your first election to get started' 
                : 'Check back later for upcoming elections'}
            </p>
            {user?.role === 'admin' && (
              <Button 
                variant="election" 
                onClick={() => navigate('/admin/create-election')}
              >
                Create First Election
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => {
              return (
                <Card key={election._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{election.title}</CardTitle>
                      {getStatusBadge(election)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {election.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Starts: {formatDate(election.start_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Ends: {formatDate(election.end_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Total Votes: {election.total_votes}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex space-x-2">
                    {election.status === 'active' && user?.role === 'user' && (
                      <Button 
                        className="flex-1"
                        onClick={() => navigate(`/elections/${election._id}/vote`)}
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Vote Now
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/elections/${election._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {(election.status === 'ended' || election.status === 'results_published') && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/elections/${election._id}/results`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    )}
                    
                    {user?.role === 'admin' && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/admin/elections/${election._id}`)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}