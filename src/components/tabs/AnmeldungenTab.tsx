import { useState, useEffect } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import type { Anmeldungen, Kurse, Teilnehmer } from '@/types/app';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, UserCheck, GraduationCap, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function AnmeldungenTab() {
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Anmeldungen | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teilnehmer: '',
    kurs: '',
    anmeldedatum: '',
    bezahlt: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [anmeldungenData, kurseData, teilnehmerData] = await Promise.all([
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getKurse(),
        LivingAppsService.getTeilnehmer(),
      ]);
      setAnmeldungen(anmeldungenData);
      setKurse(kurseData);
      setTeilnehmer(teilnehmerData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, formData.teilnehmer),
        kurs: createRecordUrl(APP_IDS.KURSE, formData.kurs),
        anmeldedatum: formData.anmeldedatum,
        bezahlt: formData.bezahlt,
      };
      if (editingItem) {
        await LivingAppsService.updateAnmeldungenEntry(editingItem.record_id, payload);
      } else {
        await LivingAppsService.createAnmeldungenEntry(payload);
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await LivingAppsService.deleteAnmeldungenEntry(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditDialog = (item: Anmeldungen) => {
    setEditingItem(item);
    setFormData({
      teilnehmer: extractRecordId(item.fields.teilnehmer) || '',
      kurs: extractRecordId(item.fields.kurs) || '',
      anmeldedatum: item.fields.anmeldedatum || '',
      bezahlt: item.fields.bezahlt || false,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      teilnehmer: '',
      kurs: '',
      anmeldedatum: new Date().toISOString().split('T')[0],
      bezahlt: false,
    });
  };

  const getTeilnehmerName = (url: string | undefined) => {
    if (!url) return 'N/A';
    const id = extractRecordId(url);
    const tn = teilnehmer.find((t) => t.record_id === id);
    return tn?.fields.name || 'N/A';
  };

  const getKursTitel = (url: string | undefined) => {
    if (!url) return 'N/A';
    const id = extractRecordId(url);
    const kurs = kurse.find((k) => k.record_id === id);
    return kurs?.fields.titel || 'N/A';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anmeldungen</h2>
          <p className="text-muted-foreground">Verwalte Kursanmeldungen und Zahlungsstatus</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Anmeldung hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {anmeldungen.map((anm) => (
          <div
            key={anm.record_id}
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <UserCheck className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{getTeilnehmerName(anm.fields.teilnehmer)}</h3>
                </div>
              </div>
              {anm.fields.bezahlt ? (
                <CheckCircle2 className="size-5 text-success shrink-0" />
              ) : (
                <XCircle className="size-5 text-destructive shrink-0" />
              )}
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="size-4" />
                <span className="truncate">{getKursTitel(anm.fields.kurs)}</span>
              </div>
              {anm.fields.anmeldedatum && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Angemeldet: {format(new Date(anm.fields.anmeldedatum), 'dd. MMM yyyy', { locale: de })}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${anm.fields.bezahlt ? 'text-success' : 'text-destructive'}`}>
                  {anm.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(anm)}>
                <Edit className="size-3" />
                Bearbeiten
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(anm.record_id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {anmeldungen.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Noch keine Anmeldungen vorhanden. Füge die erste Anmeldung hinzu!
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
            <DialogDescription>
              Füge eine neue Anmeldung hinzu oder bearbeite die Daten.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teilnehmer">Teilnehmer *</Label>
                <Select
                  value={formData.teilnehmer}
                  onValueChange={(v) => setFormData({ ...formData, teilnehmer: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Teilnehmer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {teilnehmer.map((t) => (
                      <SelectItem key={t.record_id} value={t.record_id}>
                        {t.fields.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kurs">Kurs *</Label>
                <Select value={formData.kurs} onValueChange={(v) => setFormData({ ...formData, kurs: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kurs auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {kurse.map((k) => (
                      <SelectItem key={k.record_id} value={k.record_id}>
                        {k.fields.titel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anmeldedatum">Anmeldedatum *</Label>
                <Input
                  id="anmeldedatum"
                  type="date"
                  value={formData.anmeldedatum}
                  onChange={(e) => setFormData({ ...formData, anmeldedatum: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bezahlt"
                  checked={formData.bezahlt}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, bezahlt: checked as boolean })
                  }
                />
                <Label htmlFor="bezahlt" className="cursor-pointer">
                  Bezahlt
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Anmeldung löschen"
        description="Möchtest du diese Anmeldung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
      />
    </div>
  );
}
