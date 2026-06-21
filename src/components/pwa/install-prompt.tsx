import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Download, X, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/components/pwa/use-install-prompt";

/**
 * Post-sign-in "install the app" banner. Slides up above the Spotify player.
 * On Android/Chrome/Edge it triggers the native install dialog; on iOS it shows
 * the manual Share → Add to Home Screen steps.
 */
export function InstallPrompt() {
  const { canShow, isIos, promptInstall, dismiss } = useInstallPrompt();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {canShow && (
        <motion.div
          dir="rtl"
          role="dialog"
          aria-label="התקנת אפליקציית ספרטא"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-[84px] z-[60] mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/85"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="סגור"
            className="absolute left-3 top-3 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-start gap-3 pr-1">
            <img
              src="/icon-192.png"
              alt="ספרטא"
              className="size-12 shrink-0 rounded-xl border border-border shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold">התקינו את אפליקציית ספרטא</div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {isIos
                  ? "הוסיפו למסך הבית לגישה מהירה — בדיוק כמו אפליקציה."
                  : "גישה מהירה ממסך הבית, מסך מלא וללא דפדפן."}
              </p>
            </div>
          </div>

          {isIos ? (
            <div className="mt-3 space-y-2 rounded-xl bg-muted/60 p-3 text-sm">
              <div className="flex items-center gap-2">
                <Share className="size-4 shrink-0 text-primary" />
                <span>
                  הקישו על <span className="font-semibold">שיתוף</span> בסרגל הדפדפן
                </span>
              </div>
              <div className="flex items-center gap-2">
                <SquarePlus className="size-4 shrink-0 text-primary" />
                <span>
                  בחרו <span className="font-semibold">הוספה למסך הבית</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={promptInstall}
                className="h-11 flex-1 gap-2 font-bold"
              >
                <Download className="size-4" />
                התקן עכשיו
              </Button>
              <Button variant="ghost" onClick={dismiss} className="h-11">
                לא עכשיו
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
