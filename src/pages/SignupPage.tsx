import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SignupForm } from '@/components/auth/SignupForm';
import { Vote, Shield, Users, BarChart } from 'lucide-react';

export default function SignupPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/elections');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center space-x-8">
        {/* Left side - Features */}
        <div className="hidden lg:flex flex-col items-center space-y-6 flex-1">
          <div className="flex items-center space-x-3">
            <Vote className="h-16 w-16 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Election Echo Network
            </h1>
          </div>
          <p className="text-xl text-muted-foreground text-center max-w-md">
            Join the future of democratic participation
          </p>
          
          <div className="grid grid-cols-1 gap-4 mt-8 w-full max-w-lg">
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">For Administrators</h3>
              </div>
              <p className="text-muted-foreground">
                Create and manage elections, add candidates, monitor voting progress, and publish results with complete control and transparency.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="h-8 w-8 text-vote-success" />
                <h3 className="font-semibold text-lg">For Voters</h3>
              </div>
              <p className="text-muted-foreground">
                Participate in elections with confidence, view candidate information, cast your vote securely, and track election results in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="flex-1 max-w-md">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}