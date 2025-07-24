import { Film } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary rounded-lg shadow-md">
          <Film className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-headline bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Gencut
        </h1>
      </div>
    </header>
  );
}
