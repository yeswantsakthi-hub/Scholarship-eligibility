import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isCheckingAuth } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    if (user) {
      setLocation(user.isAdmin ? "/admin" : "/dashboard");
    }
  }, [user, setLocation]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl text-foreground">Scholar<span className="text-primary">Portal</span></span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isLogin ? "Enter your credentials to access your dashboard" : "Register to start applying for scholarships"}
            </p>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    data-testid="input-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isPending}
                  data-testid="button-submit"
                >
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isLogin ? "Sign In" : "Sign Up"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  data-testid="button-toggle-auth"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Demo: <strong>admin</strong> / admin123 &nbsp;|&nbsp; <strong>student</strong> / student123
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 relative bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=1080&fit=crop"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
            Empowering the next generation of leaders
          </h2>
          <p className="text-white/90 text-lg max-w-lg drop-shadow">
            Access academic opportunities, grants, and scholarships in one centralized portal.
          </p>
        </div>
      </div>
    </div>
  );
}
