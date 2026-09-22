import { useListAuditLog } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Audit() {
  const { data: auditLogs, isLoading } = useListAuditLog({ limit: 100 });

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'invite':
        return <Badge className="bg-badge-lime text-foreground hover:bg-badge-lime/80 shadow-none border-none">Créer</Badge>;
      case 'update':
      case 'modify':
        return <Badge className="bg-badge-yellow text-yellow-900 hover:bg-badge-yellow/80 shadow-none border-none">Modifier</Badge>;
      case 'delete':
      case 'remove':
      case 'expire':
        return <Badge className="bg-badge-blush text-pink-900 hover:bg-badge-blush/80 shadow-none border-none">Supprimer</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Journal d'audit</h1>
          <p className="text-muted-foreground mt-1">Historique immuable des modifications d'accès et d'autorisations.</p>
        </div>
        
        <Button variant="outline" className="gap-2 rounded-full shadow-sm bg-background">
          <ArrowDownToLine className="h-4 w-4" />
          Exporter en CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/20">
              <TableHead className="font-semibold text-foreground w-[180px]">Horodatage</TableHead>
              <TableHead className="font-semibold text-foreground">Acteur</TableHead>
              <TableHead className="font-semibold text-foreground">Action</TableHead>
              <TableHead className="font-semibold text-foreground">Cible</TableHead>
              <TableHead className="font-semibold text-foreground w-1/3">Résumé</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  Chargement du journal d'audit...
                </TableCell>
              </TableRow>
            ) : auditLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Activity className="h-10 w-10 text-muted mb-2" />
                  Aucun journal d'audit trouvé.
                </TableCell>
              </TableRow>
            ) : (
              auditLogs?.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {log.actorName}
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{log.targetType}</span>
                      <span className="text-sm font-medium">{log.targetName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.summary}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
