import { getUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, User } from "lucide-react";
import { Ribbon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const user = getUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
              <Ribbon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary">MotherLine</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/dashboard" className="text-foreground hover:text-secondary transition-colors">Dashboard</a>
            <a href="/medical-records" className="text-foreground hover:text-secondary transition-colors">Medical Records</a>
            <a href="/wellness" className="text-foreground hover:text-secondary transition-colors">Wellness</a>
            <a href="/appointments" className="text-foreground hover:text-secondary transition-colors">Appointments</a>
          </nav>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium">
                    {user?.username || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
