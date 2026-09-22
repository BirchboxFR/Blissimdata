import { Link, Redirect } from 'wouter';
import { useAuth } from '@clerk/react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  MessageSquare, 
  Search, 
  ArrowRight,
  Database,
  PieChart,
  Activity
} from 'lucide-react';

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER: any = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const { isSignedIn } = useAuth();
  
  if (isSignedIn) return <Redirect to="/dashboard" />;
  
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl shadow-sm">
            B
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground uppercase">
            Blissim Analytics
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#contact" className="hidden md:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Nous contacter
          </a>
          <Link 
            href="/sign-in" 
            className="inline-flex items-center justify-center whitespace-nowrap transition-colors bg-foreground text-background hover:bg-foreground/90 rounded-full px-5 py-2 text-sm font-semibold shadow-sm"
          >
            Se connecter
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-6 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-[100%] blur-3xl -z-10 pointer-events-none" />
          
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-10"
            initial="hidden"
            animate="visible"
            variants={STAGGER}
          >
            <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-4">
              <Database className="w-4 h-4" />
              <span>La plateforme Data B2B</span>
            </motion.div>
            
            <motion.h1 variants={FADE_UP} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground tracking-tight leading-[1.1] uppercase">
              L'accès à la <br />
              <span className="text-primary relative inline-block">
                donnée beauté
                <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-5 text-badge-lime" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M0,10 Q100,20 200,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>
            
            <motion.p variants={FADE_UP} className="text-lg md:text-xl text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
              Connectez-vous au plus grand panel propriétaire de consommatrices beauté engagées. 
              Analysez les tendances, ciblez vos lancements et prenez des décisions stratégiques 
              appuyées par la donnée de 1,2 million de profils qualifiés.
            </motion.p>
            
            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <a 
                href="#contact" 
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap transition-transform bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5"
              >
                Demander un accès
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <Link 
                href="/sign-in" 
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap transition-colors bg-white text-foreground border-2 border-border hover:border-foreground/20 rounded-full px-8 h-14 text-base font-bold shadow-sm"
              >
                Se connecter
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Key Metrics */}
        <section className="py-16 bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 divide-x divide-border/20">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl md:text-5xl font-display font-bold text-badge-lime">1.2M+</span>
                <span className="text-sm md:text-base font-medium text-white/80">Profils beauté qualifiés</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl md:text-5xl font-display font-bold text-badge-periwinkle">50M+</span>
                <span className="text-sm md:text-base font-medium text-white/80">Points de données</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl md:text-5xl font-display font-bold text-badge-blush">2.2M+</span>
                <span className="text-sm md:text-base font-medium text-white/80">Avis clients</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl md:text-5xl font-display font-bold text-badge-yellow">500K</span>
                <span className="text-sm md:text-base font-medium text-white/80">Clientes actives</span>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight">
              Des réponses concrètes <br /> à vos enjeux
            </h2>
            <p className="text-lg text-muted-foreground">
              Ne naviguez plus à vue. Blissim Analytics traduit le comportement et l'opinion 
              de centaines de milliers de consommatrices en insights actionnables.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UseCaseCard 
              icon={<TrendingUp className="w-6 h-6 text-primary" />}
              title="Tendances du marché"
              question="Quelles sont les grandes tendances du marché ?"
              description="Identifiez les ingrédients émergents, les routines montantes et l'évolution des attentes des consommatrices avant vos concurrents."
              color="bg-primary/5"
            />
            <UseCaseCard 
              icon={<Target className="w-6 h-6 text-primary" />}
              title="Positionnement concurrentiel"
              question="Comment se positionnent nos concurrents ?"
              description="Analysez le taux de satisfaction, la notoriété et le profil des acheteuses des marques de votre segment."
              color="bg-badge-lime/20"
            />
            <UseCaseCard 
              icon={<Activity className="w-6 h-6 text-primary" />}
              title="Lancement de produit"
              question="Sur quelle cible lancer notre nouveauté ?"
              description="Définissez votre audience cible avec précision en croisant âge, type de peau, préoccupations et habitudes d'achat."
              color="bg-badge-periwinkle/20"
            />
            <UseCaseCard 
              icon={<Search className="w-6 h-6 text-primary" />}
              title="Notoriété de marque"
              question="Quelle est la notoriété de notre marque ?"
              description="Mesurez votre brand awareness globale et segmentez-la par profil pour identifier vos axes de croissance."
              color="bg-badge-blush/20"
            />
            <UseCaseCard 
              icon={<PieChart className="w-6 h-6 text-primary" />}
              title="Appétence catégorie"
              question="Quel est l'appétence pour les produits pousse-cheveux ?"
              description="Mesurez le potentiel d'une catégorie spécifique, l'intention d'achat et le budget moyen alloué par les consommatrices."
              color="bg-badge-yellow/20"
            />
            <UseCaseCard 
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Analyse de segments"
              question="Que pensent les segments 'sportives' ou 'mamans' ?"
              description="Filtrez nos données sur des segments de vie précis pour adapter vos messages et vos formulations."
              color="bg-primary/10"
            />
          </div>
        </section>
        
        {/* Deep Dive Section */}
        <section className="py-24 bg-muted/50 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight">
                  Un panel de <span className="text-primary">1.2 million</span> de profils qualifiés
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-border">
                      <Search className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Profil Beauté Détaillé</h4>
                      <p className="text-muted-foreground mt-1">Chaque abonnée Blissim renseigne son type de peau, cheveux, carnation, et préoccupations principales (anti-âge, acné, éclat...).</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-border">
                      <MessageSquare className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Avis Post-Test Authentiques</h4>
                      <p className="text-muted-foreground mt-1">Nos consommatrices testent les produits chez elles et partagent leur avis honnête et détaillé sur la sensorialité, l'efficacité et le packaging.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-border">
                      <BarChart3 className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Historique d'Achat Réel</h4>
                      <p className="text-muted-foreground mt-1">Nos données lient le déclaratif au comportement d'achat réel sur l'e-shop Blissim, offrant une vision à 360° du tunnel de conversion.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Abstract Visual Placeholder / Graphic */}
              <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-background border border-border shadow-2xl p-8 flex flex-col justify-between">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-badge-blush/40 via-background to-background"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center">
                    <Activity className="w-5 h-5 text-background" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-badge-lime/30 text-lime-800 text-xs font-bold uppercase tracking-wider">
                    En temps réel
                  </div>
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="h-2 w-1/3 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full origin-left animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="h-2 w-1/2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-foreground w-full origin-left animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }}></div>
                  </div>
                  <div className="h-2 w-1/4 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-badge-periwinkle w-full origin-left animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  
                  <div className="pt-8">
                    <h3 className="text-4xl font-display font-bold">1 248 930</h3>
                    <p className="text-muted-foreground font-medium mt-1 uppercase tracking-wide text-sm">Profils actifs indexés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 bg-card border border-border p-12 md:p-20 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-badge-yellow/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold uppercase relative z-10">
              Prêt à explorer la <br className="hidden md:block"/> donnée beauté ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto relative z-10">
              Blissim Analytics est réservé aux marques partenaires et aux professionnels de la beauté. Contactez notre équipe pour organiser une démonstration.
            </p>
            
            <div className="pt-6 relative z-10">
              <a 
                href="mailto:data@blissim.com" 
                className="inline-flex items-center justify-center whitespace-nowrap transition-transform bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 h-16 text-lg font-bold shadow-xl hover:-translate-y-1"
              >
                Organiser une démo
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xs">
              B
            </div>
            <span className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">Blissim Analytics</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Blissim. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function UseCaseCard({ 
  icon, 
  title, 
  question, 
  description,
  color
}: { 
  icon: React.ReactNode, 
  title: string, 
  question: string, 
  description: string,
  color: string
}) {
  return (
    <div className="group bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold font-display uppercase tracking-tight">{title}</h3>
        <p className="text-sm font-bold text-primary">"{question}"</p>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
