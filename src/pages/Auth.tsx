import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';
import cloudcastLogo from '@/assets/cloudcast-logo.png';

function PasswordInput({ value, onChange, placeholder, show, onToggle }: {
  value: string; onChange: (v: string) => void; placeholder: string; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
        required
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute right-1 top-1 h-8 w-8 p-0"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { label: string; met: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter(c => c.met).length;
  const labels: Record<number, { label: string; color: string }> = {
    0: { label: 'Very weak', color: 'bg-destructive' },
    1: { label: 'Weak', color: 'bg-destructive' },
    2: { label: 'Fair', color: 'bg-orange-500' },
    3: { label: 'Good', color: 'bg-yellow-500' },
    4: { label: 'Strong', color: 'bg-green-500' },
    5: { label: 'Very strong', color: 'bg-green-600' },
  };
  return { score, ...labels[score], checks };
}

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!", description: "Successfully logged in to CloudCast." });
        navigate('/');
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast({ title: "Name Required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwordStrength.score < 3) {
      toast({ title: "Weak Password", description: "Please use a stronger password.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { display_name: displayName },
        },
      });
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check Your Email", description: "We've sent you a confirmation link." });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reset Email Sent", description: "Check your email for password reset instructions." });
        setActiveTab('login');
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) {
        toast({ title: "Google Login Failed", description: error.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };




  return (
    <div className="min-h-screen bg-gradient-hero relative flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Button variant="ghost" className="mb-4 text-foreground hover:bg-white/10" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={cloudcastLogo} alt="CloudCast Logo" className="h-12 w-12 object-contain drop-shadow-lg" />
            <h1 className="text-3xl font-bold gradient-text">CloudCast</h1>
          </div>
          <p className="text-muted-foreground">Your personal weather companion</p>
        </div>

        <Card className="modern-card backdrop-blur-md bg-card/80 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in to access your personalized weather dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                  <PasswordInput value={password} onChange={setPassword} placeholder="Password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                  <PasswordInput value={password} onChange={setPassword} placeholder="Password" show={showPassword} onToggle={() => setShowPassword(!showPassword)} />

                  {/* Password Strength */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.color : 'bg-muted'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                      <div className="space-y-1">
                        {passwordStrength.checks.map((check) => (
                          <div key={check.label} className="flex items-center gap-2 text-xs">
                            {check.met ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                            <span className={check.met ? 'text-green-500' : 'text-muted-foreground'}>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm Password" show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>

              {/* Reset Tab */}
              <TabsContent value="reset" className="space-y-4">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="pl-10" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Email
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
