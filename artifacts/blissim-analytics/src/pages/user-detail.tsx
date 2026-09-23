import { useGetUser, useUpdateUser, getGetUserQueryKey, getListUsersQueryKey, useListBrands } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Save, AlertTriangle, Building2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function UserDetail({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id, 10);
  const { data: user, isLoading, error } = useGetUser(userId);
  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useListBrands();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [isSavingBrands, setIsSavingBrands] = useState(false);

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (user && initializedForId.current !== userId) {
      initializedForId.current = userId;
      setSelectedBrandIds(user.brandAccesses?.map(a => a.brandId) || []);
    }
  }, [user, userId]);

  const handleSaveBrands = () => {
    if (!user) return;
    setIsSavingBrands(true);

    // Map selected IDs back to access objects. Preserve existing if they exist, otherwise default.
    const newBrandAccesses = selectedBrandIds.map(brandId => {
      const existing = user.brandAccesses?.find(a => a.brandId === brandId);
      if (existing) {
        return {
          brandId,
          countryScope: existing.countryScope,
          expiresAt: existing.expiresAt
        };
      }
      return {
        brandId,
        countryScope: 'ALL' as const,
        expiresAt: null
      };
    });

    updateUser.mutate({
      id: userId,
      data: {
        brandAccesses: newBrandAccesses
      },
    }, {
      onSuccess: () => {
        toast({ title: 'Accès marques mis à jour avec succès.' });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setIsSavingBrands(false);
      },
      onError: (err: any) => {
        toast({ title: "Erreur lors de la mise à jour des accès", description: err.message, variant: 'destructive' });
        setIsSavingBrands(false);
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
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <Card className="order-first border-primary/30 shadow-sm bg-primary/[0.025]">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Building2 className="h-5 w-5 text-primary" />
                  Marques autorisées
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Cochez ou décochez les marques accessibles à {user?.name}, puis cliquez sur « Enregistrer les marques ». Marques d’exemple en attendant BigQuery.
                </CardDescription>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSaveBrands}
                disabled={isSavingBrands || updateUser.isPending || brandsLoading || brandsError || !brands?.length}
                className="gap-2"
              >
                {isSavingBrands ? (
                  'Enregistrement...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer les marques
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 bg-background rounded-lg border mt-2">
                {brands?.map((brand) => (
                  <div
                    key={brand.id}
                    className={`flex flex-row items-start gap-3 rounded-md border p-3 transition-colors ${
                      selectedBrandIds.includes(brand.id) ? 'border-primary/40 bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={selectedBrandIds.includes(brand.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBrandIds(prev => [...prev, brand.id]);
                        } else {
                          setSelectedBrandIds(prev => prev.filter(id => id !== brand.id));
                        }
                      }}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor={`brand-${brand.id}`} className="font-medium cursor-pointer text-sm">
                        {brand.name}
                      </Label>
                      {/* Show existing access details if they have it */}
                      {user?.brandAccesses?.find(a => a.brandId === brand.id) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.brandAccesses.find(a => a.brandId === brand.id)?.countryScope === 'ALL' 
                            ? 'Global' 
                            : (Array.isArray(user.brandAccesses.find(a => a.brandId === brand.id)?.countryScope) 
                                ? (user.brandAccesses.find(a => a.brandId === brand.id)?.countryScope as string[]).join(', ') 
                                : user.brandAccesses.find(a => a.brandId === brand.id)?.countryScope as string
                              )
                          }
                          {user.brandAccesses.find(a => a.brandId === brand.id)?.expiresAt && 
                            ` • Expire: ${format(new Date(user.brandAccesses.find(a => a.brandId === brand.id)!.expiresAt!), 'dd/MM/yyyy')}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
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
                  <dt className="text-muted-foreground">Créé le</dt>
                  <dd className="font-medium">{user?.createdAt ? format(new Date(user?.createdAt), 'd MMM yyyy', { locale: fr }) : '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
