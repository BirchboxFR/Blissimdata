import { useState } from 'react';
import { useListPages, useCreatePage, getListPagesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const pageSchema = z.object({
  name: z.string().min(2, 'Le nom de la page est requis'),
  key: z.string().min(2, 'La clé de la page est requise').regex(/^[a-z0-9-_]+$/, 'Caractères alphanumériques minuscules et tirets uniquement'),
  description: z.string(),
});

export default function Pages() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useListPages();
  const createPage = useCreatePage();

  const form = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: { name: '', key: '', description: '' }
  });

  const onSubmit = (values: z.infer<typeof pageSchema>) => {
    createPage.mutate({
      data: values
    }, {
      onSuccess: () => {
        toast({ title: 'Page enregistrée avec succès.' });
        setIsCreateOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListPagesQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Erreur lors de l'enregistrement de la page", description: err.message, variant: 'destructive' });
      }
    });
  };

  const filteredPages = pages?.filter(page => 
    page.name.toLowerCase().includes(search.toLowerCase()) || 
    page.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Pages de reporting</h1>
          <p className="text-muted-foreground mt-1">Registre de toutes les pages de reporting protégées par le système.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full px-6 shadow-sm">
              <Plus className="h-4 w-4" />
              Enregistrer une page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-display">Enregistrer une page de reporting</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la page</FormLabel>
                      <FormControl>
                        <Input placeholder="ex. Aperçu des ventes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clé unique</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="apercu-ventes" className="pl-9 font-mono text-sm" {...field} />
                        </div>
                      </FormControl>
                      <p className="text-[0.8rem] text-muted-foreground">Utilisé dans le code pour vérifier les permissions.</p>
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
                        <Textarea placeholder="Objectif de cette page de reporting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createPage.isPending} className="rounded-full px-6">
                    {createPage.isPending ? 'Enregistrement...' : 'Enregistrer la page'}
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
            placeholder="Rechercher des pages par nom ou clé..." 
            className="pl-9 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">Page</TableHead>
              <TableHead className="font-semibold text-foreground">Clé de routage</TableHead>
              <TableHead className="font-semibold text-foreground w-1/2">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Chargement des pages...
                </TableCell>
              </TableRow>
            ) : filteredPages?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  Aucune page ne correspond à votre recherche.
                </TableCell>
              </TableRow>
            ) : (
              filteredPages?.map((page) => (
                <TableRow key={page.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-foreground">{page.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted font-mono text-xs text-muted-foreground border">
                      <LinkIcon className="h-3 w-3" />
                      {page.key}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {page.description}
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
