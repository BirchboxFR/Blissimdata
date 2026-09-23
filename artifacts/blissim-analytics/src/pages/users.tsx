import { useState, useEffect } from 'react';
import { useListUsers, useInviteUser, getListUsersQueryKey, useListBrands } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Filter, Shield, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const inviteSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  brandIds: z.array(z.number()).optional()
}).superRefine((data, ctx) => {
  if (!data.brandIds || data.brandIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Sélectionnez au moins une marque.",
      path: ["brandIds"]
    });
  }
});

export default function Users() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: users, isLoading } = useListUsers(debouncedSearch ? { search: debouncedSearch } : undefined);
  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useListBrands();
  const inviteUser = useInviteUser();

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      name: '',
      brandIds: [],
    }
  });

  const onSubmit = (values: z.infer<typeof inviteSchema>) => {
    const brandAccesses = values.brandIds ? values.brandIds.map(brandId => ({
      brandId,
      countryScope: 'ALL' as const,
      expiresAt: null
    })) : [];

    inviteUser.mutate({
      data: {
        email: values.email,
        name: values.name,
        role: 'brand',
        brandAccesses,
        packageIds: []
      }
    }, {
      onSuccess: () => {
        toast({ title: 'Utilisateur invité avec succès.' });
        setIsInviteOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Erreur lors de l'invitation de l'utilisateur", description: err.message, variant: 'destructive' });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-badge-lime text-foreground hover:bg-badge-lime/80 shadow-none">Actif</Badge>;
      case 'invited': return <Badge className="bg-badge-periwinkle text-foreground hover:bg-badge-periwinkle/80 shadow-none">Invité</Badge>;
      case 'expired': return <Badge className="bg-destructive text-destructive-foreground shadow-none">Expiré</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les accès et les invitations des utilisateurs.</p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full px-6 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Inviter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display">Inviter un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Jeanne Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse e-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="jeanne@exemple.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="brandIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Accès aux marques</FormLabel>
                           <p className="text-[0.8rem] text-muted-foreground">Cochez une ou plusieurs marques d’exemple. Le catalogue BigQuery les remplacera une fois connecté.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto p-4 bg-muted/30 rounded-md border">
                          {brands?.map((brand) => (
                            <FormField
                              key={brand.id}
                              control={form.control}
                              name="brandIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={brand.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(brand.id)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          return checked
                                            ? field.onChange([...current, brand.id])
                                            : field.onChange(
                                                current.filter((value) => value !== brand.id)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer text-sm">
                                      {brand.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                           {brandsLoading && (
                             <div className="col-span-2 text-sm text-muted-foreground text-center py-4">Chargement des marques...</div>
                           )}
                           {brandsError && (
                             <div className="col-span-2 text-sm text-destructive text-center py-4">Impossible de charger les marques. Réessayez plus tard.</div>
                           )}
                           {!brandsLoading && !brandsError && brands?.length === 0 && (
                            <div className="col-span-2 text-sm text-muted-foreground text-center py-4">
                              Aucune marque disponible.
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                />

                <div className="pt-4 flex justify-end">
                   <Button type="submit" disabled={inviteUser.isPending || brandsLoading || brandsError || !brands?.length} className="rounded-full px-6">
                    {inviteUser.isPending ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des utilisateurs par nom ou e-mail..." 
            className="pl-9 bg-background/50 border-transparent focus-visible:border-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Utilisateur</TableHead>
              <TableHead className="font-semibold text-foreground">Marques autorisées</TableHead>
              <TableHead className="font-semibold text-foreground">Rôle</TableHead>
              <TableHead className="font-semibold text-foreground">Statut</TableHead>
              <TableHead className="font-semibold text-foreground">Dernière activité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Chargement des utilisateurs...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Aucun utilisateur ne correspond à vos critères.
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id} className="group transition-colors">
                  <TableCell>
                    <Link href={`/users/${user.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {user.brandAccesses.length ? (
                      <span className="font-medium text-sm">{user.brandAccesses.map(access => access.brandName).join(', ')}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Aucune marque</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      {user.role === 'admin' ? <Shield className="h-4 w-4 text-primary" /> : <Key className="h-4 w-4 text-muted-foreground" />}
                      <span className="capitalize">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur Marque'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'd MMM yyyy', { locale: fr }) : 'Jamais'}
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
