import { useState } from 'react';
import { useListPackages, useCreatePackage, useUpdatePackage, getListPackagesQueryKey, useListPages } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Search, FileText, CheckCircle2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const packageSchema = z.object({
  name: z.string().min(2, 'Le nom du pack est requis'),
  description: z.string(),
  isDefault: z.boolean().default(false),
  pageIds: z.array(z.number()),
});

export default function Packages() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useListPackages();
  const { data: pages } = useListPages();
  const createPackage = useCreatePackage();

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: { name: '', description: '', isDefault: false, pageIds: [] }
  });

  const onSubmit = (values: z.infer<typeof packageSchema>) => {
    createPackage.mutate({
      data: values
    }, {
      onSuccess: () => {
        toast({ title: 'Pack créé avec succès.' });
        setIsCreateOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: 'Erreur lors de la création du pack', description: err.message, variant: 'destructive' });
      }
    });
  };

  const filteredPackages = packages?.filter(pkg => 
    pkg.name.toLowerCase().includes(search.toLowerCase()) || 
    pkg.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Packs d'autorisations</h1>
          <p className="text-muted-foreground mt-1">Ensembles réutilisables d'accès aux pages de reporting.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full px-6 shadow-sm">
              <Plus className="h-4 w-4" />
              Nouveau pack
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Créer un pack</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du pack</FormLabel>
                      <FormControl>
                        <Input placeholder="ex. Logistique standard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="À quoi ce pack donne-t-il accès ?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel>Attribution automatique</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Attribuer automatiquement aux nouveaux utilisateurs
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pageIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Pages incluses</FormLabel>
                        <p className="text-[0.8rem] text-muted-foreground">
                          Sélectionnez les pages de reporting incluses dans ce pack.
                        </p>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-md border p-3 bg-muted/10">
                        {pages?.map((page) => (
                          <FormField
                            key={page.id}
                            control={form.control}
                            name="pageIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={page.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 p-2 hover:bg-muted/50 rounded-md transition-colors"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(page.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, page.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== page.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <Label className="font-medium cursor-pointer leading-tight">
                                    {page.name}
                                    <span className="block text-xs text-muted-foreground font-normal mt-0.5">{page.key}</span>
                                  </Label>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createPackage.isPending} className="rounded-full px-6">
                    {createPackage.isPending ? 'Création...' : 'Créer un pack'}
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
            placeholder="Rechercher des packs..." 
            className="pl-9 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl border bg-card p-6 shadow-sm animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full mt-4"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
              </div>
            </div>
          ))
        ) : filteredPackages?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            Aucun pack trouvé.
          </div>
        ) : (
          filteredPackages?.map(pkg => (
            <div key={pkg.id} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {pkg.isDefault && (
                <div className="absolute top-0 right-0 bg-badge-yellow/20 text-yellow-800 text-xs font-bold px-3 py-1 rounded-bl-lg border-b border-l border-badge-yellow flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  PAR DÉFAUT
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl leading-tight">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{pkg.description}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
                <div className="flex flex-col bg-muted/30 p-3 rounded-lg border border-transparent hover:border-border transition-colors">
                  <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Pages
                  </span>
                  <span className="text-2xl font-bold font-display">{pkg.pageCount}</span>
                </div>
                <div className="flex flex-col bg-muted/30 p-3 rounded-lg border border-transparent hover:border-border transition-colors">
                  <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Assigné à
                  </span>
                  <span className="text-2xl font-bold font-display">{pkg.userCount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
