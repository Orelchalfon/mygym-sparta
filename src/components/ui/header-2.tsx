import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { Dumbbell } from 'lucide-react';

type NavLink = { label: string; href: string };

export interface HeaderProps {
  links?: NavLink[];
  brand?: React.ReactNode;
  onSignIn?: () => void;
  onGetStarted?: () => void;
  /** Replaces the default Sign In / Get Started buttons on desktop & mobile. */
  actions?: React.ReactNode;
}

const defaultLinks: NavLink[] = [
  { label: 'תכונות', href: '#features' },
  { label: 'מחירים', href: '#pricing' },
  { label: 'אודות', href: '#about' },
];

export function Header({
  links = defaultLinks,
  brand,
  onSignIn,
  onGetStarted,
  actions,
}: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled || open
          ? 'bg-background/80 backdrop-blur-md border-b border-border'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-lg">
            {brand ?? (
              <>
                <Dumbbell className="h-6 w-6 text-primary" />
                <span>Sparta Gym</span>
              </>
            )}
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {actions ?? (
              <>
                <Button variant="ghost" onClick={onSignIn}>
                  התחברות
                </Button>
                <Button onClick={onGetStarted}>התחל עכשיו</Button>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground"
          >
            <MenuToggleIcon open={open} className="h-6 w-6" />
          </button>
        </div>

        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            open ? 'max-h-96 pb-6' : 'max-h-0',
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-base font-medium text-foreground/80 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-4">
            {actions ?? (
              <>
                <Button variant="ghost" onClick={onSignIn}>
                  התחברות
                </Button>
                <Button onClick={onGetStarted}>התחל עכשיו</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
