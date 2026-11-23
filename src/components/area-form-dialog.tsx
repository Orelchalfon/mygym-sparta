import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createArea, deleteArea, updateArea, type Area } from "@/lib/workout.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AreaFormDialogProps {
  /** Present → edit mode (with delete); absent → add mode. */
  area?: Area;
  /** Machines in the area, for the delete warning. */
  machineCount?: number;
  onClose: () => void;
  onDeleted?: () => void;
}

export function AreaFormDialog({
  area,
  machineCount = 0,
  onClose,
  onDeleted,
}: AreaFormDialogProps) {
  const isEdit = !!area;
  const qc = useQueryClient();
  const router = useRouter();
  const createFn = useServerFn(createArea);
  const updateFn = useServerFn(updateArea);
  const deleteFn = useServerFn(deleteArea);

  const [name, setName] = useState(area?.name ?? "");
  const [error, setError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = useMutation({
    mutationFn: (n: string): Promise<unknown> =>
      area ? updateFn({ data: { key: area.key, name: n } }) : createFn({ data: { name: n } }),
    onSuccess: () => {
      // Refetch first, then re-run loaders: ensureQueryData would otherwise hand head() the
      // cached old name and the tab title would stay stale.
      void qc.invalidateQueries({ queryKey: ["areas"] }).then(() => router.invalidate());
      toast.success(isEdit ? "השם עודכן" : "האזור נוסף");
      onClose();
    },
    onError: () => toast.error("השמירה נכשלה. בדקו את החיבור ונסו שוב."),
  });

  const del = useMutation({
    mutationFn: () => deleteFn({ data: { key: area!.key } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas"] });
      qc.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("האזור נמחק");
      onClose();
      onDeleted?.();
    },
    onError: () => toast.error("המחיקה נכשלה. נסו שוב."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      setError("הזינו שם לאזור");
      document.getElementById("area-name")?.focus();
      return;
    }
    save.mutate(n);
  }

  const busy = save.isPending || del.isPending;

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {isEdit ? "עריכת אזור" : "הוספת אזור"}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? "שנו את שם האזור או מחקו אותו." : "למשל: יד קדמית, גב עליון, יום רגליים."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="area-name">שם האזור</Label>
              <Input
                id="area-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(undefined);
                }}
                maxLength={40}
                autoFocus={!isEdit}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? "area-name-error" : undefined}
                className="h-11"
              />
              {error && (
                <p id="area-name-error" role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="mt-1 gap-3 sm:justify-between">
              {isEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="touch"
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 aria-hidden />
                  מחיקת אזור
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <Button type="submit" size="touch" disabled={busy} className="font-bold sm:min-w-40">
                {save.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <Check aria-hidden />
                )}
                {save.isPending ? "שומר..." : isEdit ? "שמירה" : "הוספה"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isEdit && (
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>למחוק את {area.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                {machineCount === 0
                  ? "האזור יימחק. היסטוריית האימונים נשמרת."
                  : machineCount === 1
                    ? "האזור והמכשיר שבו יימחקו לצמיתות. היסטוריית האימונים נשמרת."
                    : `האזור ו-${machineCount} המכשירים שבו יימחקו לצמיתות. היסטוריית האימונים נשמרת.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-11">ביטול</AlertDialogCancel>
              <AlertDialogAction
                className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  del.mutate();
                }}
                disabled={del.isPending}
              >
                {del.isPending && <Loader2 className="animate-spin" aria-hidden />}
                מחיקה
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
