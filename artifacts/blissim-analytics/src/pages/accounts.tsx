import { useState } from 'react';
import { useListAccounts, useCreateAccount, getListAccountsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const accountSchema = z.object({
  name: z.string().min(1, 'Le nom du compte est requis'),
});

export default function Accounts() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useListAccounts();
  const createAccount = useCreateAccount();

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '' }
  });

  const onSubmit = (values: z.infer<typeof accountSchema>) => {
    createAccount.mutate({
      data: {
        name: values.name,
        brandIds: []
      }
    }, {
      onSuccess: () => {
        toast({ title: 'Compte créé avec succès.' });
        setIsCreateOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: 'Erreur lors de la création du compte', description: err.message, variant: 'destructive' });
      }
    });
  };

  const filteredAccounts = accounts?.filter(acc => 
    acc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Comptes</h1>
          <p className="text-muted-foreground mt-1">Gérez les comptes partenaires et les marques.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full px-6 shadow-sm">
              <Plus className="h-4 w-4" />
              Nouveau compte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display">Créer un compte</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du compte</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Partner Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createAccount.isPending} className="rounded-full px-6">
                    {createAccount.isPending ? 'Création...' : 'Créer un compte'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des comptes..." 
            className="pl-9 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl border bg-card p-6 shadow-sm animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
              <div className="h-10 bg-muted rounded w-full mt-6"></div>
            </div>
          ))
        ) : filteredAccounts?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            Aucun compte ne correspond à votre recherche.
          </div>
        ) : (
          filteredAccounts?.map(account => (
            <div key={account.id} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col hover:border-primary/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg leading-tight">{account.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {account.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 mb-6">
                <div className="text-sm font-medium mb-2 text-foreground">Marques associées</div>
                <div className="flex flex-wrap gap-2">
                  {account.brands?.length > 0 ? (
                    account.brands.map(brand => (
                      <Badge key={brand.id} variant="secondary" className="font-medium bg-secondary hover:bg-secondary/80">
                        {brand.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Aucune marque assignée</span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{account.userCount} Utilisateurs</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Ajouté en {format(new Date(account.createdAt), 'MMM yyyy')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
