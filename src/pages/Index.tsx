import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Vote, Shield, Users, BarChart, CheckCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Secure Elections',
      description: 'Advanced encryption and security measures ensure election integrity and voter privacy.',
    },
    {
      icon: Users,
      title: 'Easy Management',
      description: 'Intuitive admin tools for creating elections, managing candidates, and monitoring progress.',
    },
    {
      icon: Vote,
      title: 'Simple Voting',
      description: 'User-friendly voting interface that makes participation accessible to everyone.',
    },
    {
      icon: BarChart,
      title: 'Real-time Results',
      description: 'Live vote tracking and instant result publication when elections conclude.',
    },
  ];

  const stats = [
    { icon: CheckCircle, label: 'Secure Votes', value: '100%' },
    { icon: Clock, label: 'Real-time', value: 'Live' },
    { icon: Eye, label: 'Transparent', value: 'Always' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Vote className="h-16 w-16 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Election Echo Network
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Empowering democratic participation through secure, transparent, and accessible digital elections
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <p className="text-lg text-foreground">
                    Welcome back, {user?.full_name}! 
                    {user?.role === 'admin' && (
                      <span className="text-primary font-semibold"> (Administrator)</span>
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      onClick={() => navigate('/elections')}
                    >
                      View Elections
                    </Button>
                    {user?.role === 'admin' && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => navigate('/admin')}
                      >
                        Admin Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Button 
                    size="lg"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted Election Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need for conducting secure, transparent, 
              and efficient elections at any scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your First Election?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of organizations using Election Echo Network for their democratic processes.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/signup')}
                >
                  Create Account
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
