import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser, useClerk } from '@clerk/react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Activity,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Packs d\'autorisations', href: '/packages', icon: Package },
  { name: 'Pages', href: '/pages', icon: FileText },
  { name: 'Journal d\'audit', href: '/audit', icon: Activity },
];

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const { user } = useUser();
  const { signOut } = useClerk();

  const NavContent = () => (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
          B
        </div>
        <span className="font-display font-bold text-xl tracking-tight">Analytics</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = location.startsWith(item.href) && (item.href !== '/dashboard' || location === '/dashboard');
          return (
            <Link key={item.name} href={item.href}>
              <div 
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 rounded-md border p-3 mt-auto bg-card shadow-sm justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user?.fullName || 'User'} className="h-full w-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-sm">
                {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{user?.fullName || 'Mon compte'}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.emailAddresses[0]?.emailAddress}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 px-2 h-8 text-xs text-muted-foreground" onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL })}>
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-sidebar">
        <NavContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 lg:px-10 lg:py-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
