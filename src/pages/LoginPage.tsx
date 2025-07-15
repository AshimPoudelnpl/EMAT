import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { Vote } from 'lucide-react';

export default function LoginPage() {
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
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center space-y-6 flex-1">
          <div className="flex items-center space-x-3">
            <Vote className="h-16 w-16 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Election Echo Network
            </h1>
          </div>
          <p className="text-xl text-muted-foreground text-center max-w-md">
            Secure, transparent, and accessible democratic participation for everyone
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-card p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-primary">Secure Voting</h3>
              <p className="text-sm text-muted-foreground">
                Advanced encryption ensures your vote remains private and secure
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-primary">Real-time Results</h3>
              <p className="text-sm text-muted-foreground">
                View election results as they happen with live updates
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}