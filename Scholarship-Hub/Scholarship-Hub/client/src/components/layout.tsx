import { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { LogOut, GraduationCap, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { data: user } = useAuth();
  const { mutate: logout } = useLogout();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user?.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Scholar<span className="text-primary">Portal</span>
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium">
                {user.isAdmin ? (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{user.username}</span>
                <span className="text-xs text-muted-foreground ml-1 uppercase tracking-wider">
                  ({user.isAdmin ? "Admin" : "Student"})
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
