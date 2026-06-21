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
  /**
   * When true, the header is transparent at the top of the page and assumes
   * it's sitting over a dark hero — text/icons are forced to light colors
   * for contrast until the user scrolls.
   */
  transparentOnTop?: boolean;
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
  transparentOnTop = false,
}: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const solid = scrolled || open;
  // When over the hero we force light colors regardless of theme.
  const overHero = transparentOnTop && !solid;

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
        solid
          ? 'bg-background/80 backdrop-blur-md border-b border-border'
          : transparentOnTop
            ? 'bg-transparent'
            : 'bg-background/60 backdrop-blur-md border-b border-border/60',
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <a
            href="/"
            className={cn(
              'flex items-center gap-2 font-bold text-lg transition-colors',
              overHero ? 'text-white' : 'text-foreground',
            )}
          >
            {brand ?? (
              <>
                <Dumbbell
                  className={cn(
                    'h-6 w-6',
                    overHero ? 'text-red-500' : 'text-primary',
                  )}
                />
                <span>Sparta Gym</span>
              </>
            )}
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  overHero
                    ? 'text-white/85 hover:text-white'
                    : 'text-foreground/80 hover:text-foreground',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {actions ?? (
              <>
                <Button
                  variant="ghost"
                  onClick={onSignIn}
                  className={
                    overHero ? 'text-white hover:bg-white/10 hover:text-white' : undefined
                  }
                >
                  התחברות
                </Button>
                <Button onClick={onGetStarted}>התחל עכשיו</Button>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={cn(
              'md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md transition-colors',
              overHero ? 'text-white' : 'text-foreground',
            )}
          >
            <MenuToggleIcon open={open} className="h-6 w-6" />
          </button>
        </div>

        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-500 ease-in-out',
            open
              ? 'max-h-[28rem] opacity-100 translate-y-0 pb-6'
              : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none',
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
