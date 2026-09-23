import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { frFR } from '@clerk/localizations';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, useLocation, Router as WouterRouter, Redirect } from 'wouter';

import Home from '@/pages/home';
import SignInPage from '@/pages/sign-in';
import SignUpPage from '@/pages/sign-up';
import Dashboard from '@/pages/dashboard';
import Users from '@/pages/users';
import UserDetail from '@/pages/user-detail';
import Packages from '@/pages/packages';
import Pages from '@/pages/pages';
import Audit from '@/pages/audit';
import NotFound from '@/pages/not-found';
import { Shell } from '@/components/shell';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: { component: any, [key: string]: any }) {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <Route {...rest}>
      {params => {
        if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
        if (!isSignedIn) return <Redirect href="/" />;
        return <Component params={params} />;
      }}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      
      <Route>
        <Shell>
          <Switch>
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/users" component={Users} />
            <ProtectedRoute path="/users/:id" component={UserDetail} />
            <ProtectedRoute path="/packages" component={Packages} />
            <ProtectedRoute path="/pages" component={Pages} />
            <ProtectedRoute path="/audit" component={Audit} />
            <Route component={NotFound} />
          </Switch>
        </Shell>
      </Route>
    </Switch>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkQueryClientCacheInvalidator() {
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, [sessionId, queryClient]);
  
  return null;
}

function ClerkProviderWithRouter({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const handleNavigate = (to: string, replace?: boolean) => {
    let path = to;
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    if (base && path.startsWith(base)) {
      path = path.slice(base.length) || '/';
    }
    setLocation(path, { replace });
  };

  const publishableKey = publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  );
  const proxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      proxyUrl={proxyUrl}
      routerPush={(to) => handleNavigate(to, false)}
      routerReplace={(to) => handleNavigate(to, true)}
      signInUrl={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sign-in`}
      signUpUrl={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sign-up`}
      localization={frFR}
    >
      <ClerkQueryClientCacheInvalidator />
      {children}
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ClerkProviderWithRouter>
            <RoutedErrorBoundary>
              <Router />
            </RoutedErrorBoundary>
          </ClerkProviderWithRouter>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
