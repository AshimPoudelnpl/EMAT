import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Vote, BarChart3, Calendar, Clock, Eye, UserCheck, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Election } from '@/types';
import { api } from '@/services/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
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

  const fetchStudentsCount = useCallback(async () => {
    try {
      const response = await api.students.getStudentsCount();
      if (response.data) {
        setStudentsCount(response.data.count);
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
    fetchElections();
    fetchStudentsCount();
  }, [user, navigate, fetchElections, fetchStudentsCount]);

  const handleActivateElection = async (electionId: string) => {
    try {
      const response = await api.elections.activateElection(electionId);
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Election activated successfully',
        });
        fetchElections();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to activate election',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate election',
        variant: 'destructive',
      });
    }
  };

  const handleEndElection = async (electionId: string) => {
    try {
      const response = await api.elections.endElection(electionId);
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Election ended successfully',
        });
        fetchElections();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to end election',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end election',
        variant: 'destructive',
      });
    }
  };

  const handlePublishResults = async (electionId: string) => {
    try {
      const response = await api.elections.publishResults(electionId);
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Results published successfully',
        });
        fetchElections();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to publish results',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish results',
        variant: 'destructive',
      });
    }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'admin') {
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

  const totalElections = elections.length;
  const activeElections = elections.filter(e => e.status === 'active').length;
  const totalVotes = elections.reduce((sum, e) => sum + e.total_votes, 0);
  const completedElections = elections.filter(e => e.status === 'results_published').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage elections and view analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/create-election')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Election
          </Button>
          <Button onClick={() => navigate('/admin/students')} variant="outline" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Manage Students
          </Button>
          <Button onClick={() => navigate('/admin/student-validator')} variant="outline" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Validate Student IDs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeElections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedElections}</div>
          </CardContent>
        </Card>
      </div>

      {/* Elections Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Elections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election._id}>
                  <TableCell className="font-medium">{election.title}</TableCell>
                  <TableCell>{getStatusBadge(election.status)}</TableCell>
                  <TableCell>{formatDate(election.start_time)}</TableCell>
                  <TableCell>{formatDate(election.end_time)}</TableCell>
                  <TableCell>{election.candidates.length}</TableCell>
                  <TableCell>{election.total_votes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/elections/${election._id}`)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {election.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateElection(election._id)}
                        >
                          Activate
                        </Button>
                      )}
                      
                      {election.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndElection(election._id)}
                        >
                          End
                        </Button>
                      )}
                      
                      {election.status === 'ended' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishResults(election._id)}
                        >
                          Publish Results
                        </Button>
                      )}
                      
                      {election.status === 'results_published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/elections/${election._id}/results`)}
                        >
                          View Results
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
