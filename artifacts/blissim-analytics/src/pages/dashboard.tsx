import { useGetDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, AlertTriangle, Activity, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground font-medium">Échec du chargement des données du tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Vue d'ensemble</h1>
        <p className="text-muted-foreground mt-1">Métriques et activité récente sur les comptes gérés.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Comptes
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{dashboard?.accounts || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Total Utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{dashboard?.users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{dashboard?.activeUsers || 0} actuellement actif(s)</p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Marques
              </CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{dashboard?.brands || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Accès Expirants
              </CardTitle>
              <AlertTriangle className={`h-4 w-4 ${dashboard?.expiringAccesses ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{dashboard?.expiringAccesses || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activité Récente
        </h2>
        
        <Card className="border-border shadow-sm">
          <div className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : dashboard?.recentActivity?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Aucune activité récente trouvée.
              </div>
            ) : (
              dashboard?.recentActivity?.map((event) => (
                <div key={event.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium text-sm">
                      <span className="font-semibold">{event.actorName}</span>{' '}
                      <span className="text-muted-foreground">{event.action.toLowerCase()}</span>{' '}
                      <span className="font-semibold text-foreground">{event.targetName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.summary}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.createdAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
