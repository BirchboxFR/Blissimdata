import { SignUp } from '@clerk/react';
import { Link } from 'wouter';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse">
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shadow-sm">
                B
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">Blissim</span>
            </Link>
          </div>
          
          <div className="flex justify-center w-full">
            <SignUp 
              path={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sign-up`}
              routing="path" 
              signInUrl={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sign-in`}
              appearance={{
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "border border-border shadow-md rounded-2xl w-full max-w-none bg-card",
                  headerTitle: "font-display font-bold text-2xl text-foreground",
                  headerSubtitle: "font-sans text-muted-foreground",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm transition-all h-10",
                  formFieldInput: "rounded-md border-border h-10 bg-input/50 focus:bg-background",
                  formFieldLabel: "font-medium text-foreground",
                  footerActionLink: "text-primary hover:text-primary/90 font-medium",
                  identityPreviewText: "text-foreground font-medium",
                  identityPreviewEditButton: "text-primary hover:text-primary/90",
                  dividerText: "text-muted-foreground",
                  dividerLine: "bg-border"
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 bg-sidebar border-r items-center justify-center p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/5 pattern-grid" />
        <div className="max-w-md space-y-6 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">
            Rejoignez l'espace <br/>d'administration.
          </h2>
          <p className="text-muted-foreground font-sans text-lg">
            Connectez-vous à Blissim Analytics pour gérer les utilisateurs et leurs accès aux marques.
          </p>
          
          <div className="mt-8 p-6 bg-card border rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-badge-periwinkle flex items-center justify-center text-foreground font-bold">
                J
              </div>
              <div>
                <div className="font-semibold">Julien</div>
                <div className="text-xs text-muted-foreground">Administrateur</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-border rounded-full"></div>
              <div className="h-2 w-5/6 bg-border rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
