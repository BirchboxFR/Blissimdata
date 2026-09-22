import { useGetUser, useUpdateUser, getGetUserQueryKey, useListAccounts } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Save, AlertTriangle, User as UserIcon, Building2, Package, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const userUpdateSchema = z.object({
  name: z.string().min(2),
  status: z.enum(['active', 'invited', 'expired']),
  accountId: z.coerce.number().nullable().optional(),
});

export default function UserDetail({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id, 10);
  const { data: user, isLoading, error } = useGetUser(userId);
  const { data: accounts } = useListAccounts();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: '',
      status: 'active',
      accountId: null,
    }
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (user && initializedForId.current !== userId) {
      initializedForId.current = userId;
      form.reset({
        name: user.name,
        status: user.status as any,
        accountId: user.accountId,
      });
    }
  }, [user, userId, form]);

  const onSubmit = (values: z.infer<typeof userUpdateSchema>) => {
    updateUser.mutate({
      id: userId,
      data: values,
    }, {
      onSuccess: () => {
        toast({ title: 'Utilisateur mis à jour avec succès.' });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) });
      },
      onError: (err: any) => {
        toast({ title: "Erreur lors de la mise à jour de l'utilisateur", description: err.message, variant: 'destructive' });
      }
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground font-medium">Utilisateur introuvable ou permissions insuffisantes.</p>
        <Button variant="outline" onClick={() => setLocation('/users')}>Retour aux utilisateurs</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-[400px]" />
          <Skeleton className="col-span-1 h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/users" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {user?.status === 'active' && <Badge className="bg-badge-lime text-foreground hover:bg-badge-lime/80">Actif</Badge>}
          {user?.status === 'invited' && <Badge className="bg-badge-periwinkle text-foreground hover:bg-badge-periwinkle/80">Invité</Badge>}
          {user?.status === 'expired' && <Badge className="bg-destructive text-destructive-foreground">Expiré</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <UserIcon className="h-5 w-5 text-primary" />
                Identité et Informations
              </CardTitle>
              <CardDescription>Gérez les informations principales et le statut de l'utilisateur.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <Label htmlFor="user-email">Adresse e-mail</Label>
                      <Input id="user-email" value={user?.email ?? ''} disabled className="bg-muted/50 cursor-not-allowed" />
                      <p className="text-[0.8rem] text-muted-foreground">L'adresse e-mail ne peut pas être modifiée.</p>
                    </FormItem>
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Actif</SelectItem>
                              <SelectItem value="invited">Invité</SelectItem>
                              <SelectItem value="expired">Expiré</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compte assigné</FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(val === 'unassigned' ? null : parseInt(val, 10))} 
                            value={field.value ? field.value.toString() : 'unassigned'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un compte" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="unassigned">Non assigné</SelectItem>
                              {accounts?.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                  {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 text-sm flex items-center gap-2">
                        {user?.role === 'admin' ? <Shield className="h-4 w-4 text-primary" /> : <UserIcon className="h-4 w-4 text-muted-foreground" />}
                        <span className="capitalize">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur Marque'}</span>
                      </div>
                      <p className="text-[0.8rem] text-muted-foreground">Le changement de rôle nécessite une nouvelle invitation.</p>
                    </FormItem>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={updateUser.isPending} className="gap-2 rounded-full px-6 shadow-sm">
                      <Save className="h-4 w-4" />
                      {updateUser.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Building2 className="h-5 w-5 text-primary" />
                Périmètres d'accès marques
              </CardTitle>
              <CardDescription>Marques et pays spécifiques auxquels cet utilisateur a accès.</CardDescription>
            </CardHeader>
            <CardContent>
              {user?.brandAccesses?.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                  Aucun accès marque configuré.
                </div>
              ) : (
                <div className="space-y-4">
                  {user?.brandAccesses?.map((access, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card shadow-sm hover:border-primary/30 transition-colors">
                      <div>
                        <div className="font-semibold text-foreground">{access.brandName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <span>Pays :</span>
                          <span className="font-medium text-foreground">
                            {access.countryScope === 'ALL' ? 'Global (Tous)' : (Array.isArray(access.countryScope) ? access.countryScope.join(', ') : access.countryScope)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        {access.expiresAt ? (
                          <Badge variant="outline" className="border-destructive/30 text-destructive">
                            Expire le : {format(new Date(access.expiresAt), 'd MMM yyyy', { locale: fr })}
                          </Badge>
                        ) : (
                          <Badge className="bg-badge-lime text-foreground hover:bg-badge-lime/80 shadow-none">
                            N'expire jamais
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card className="border-border shadow-sm bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Package className="h-5 w-5 text-primary" />
                Packs d'autorisations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user?.packageIds?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucun pack assigné.</p>
                ) : (
                  user?.packageIds?.map(pkgId => (
                    <div key={pkgId} className="flex items-center justify-between p-3 bg-background rounded-md border shadow-sm">
                      <span className="font-medium text-sm">Pack #{pkgId}</span>
                      <Badge variant="secondary">Actif</Badge>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full mt-4 bg-background">
                  Gérer les packs
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">Métadonnées système</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono font-medium">{user?.id}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Type d'authentification</dt>
                  <dd className="font-medium capitalize">{user?.authType}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Créé le</dt>
                  <dd className="font-medium">{user?.createdAt ? format(new Date(user?.createdAt), 'd MMM yyyy', { locale: fr }) : '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Compte</dt>
                  <dd className="font-medium">{user?.accountName || 'Non assigné'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
