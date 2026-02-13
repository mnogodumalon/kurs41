import { useState, useEffect } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import type { Kurse, Dozenten, Raeume } from '@/types/app';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, GraduationCap, Calendar, Users, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function KurseTab() {
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kurse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    startdatum: '',
    enddatum: '',
    max_teilnehmer: '',
    preis: '',
    dozent: '',
    raum: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kurseData, dozentenData, raeumeData] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getRaeume(),
      ]);
      setKurse(kurseData);
      setDozenten(dozentenData);
      setRaeume(raeumeData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        titel: formData.titel,
        beschreibung: formData.beschreibung || undefined,
        startdatum: formData.startdatum,
        enddatum: formData.enddatum,
        max_teilnehmer: Number(formData.max_teilnehmer),
        preis: Number(formData.preis),
        dozent: createRecordUrl(APP_IDS.DOZENTEN, formData.dozent),
        raum: createRecordUrl(APP_IDS.RAEUME, formData.raum),
      };
      if (editingItem) {
        await LivingAppsService.updateKurseEntry(editingItem.record_id, payload);
      } else {
        await LivingAppsService.createKurseEntry(payload);
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
      await LivingAppsService.deleteKurseEntry(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditDialog = (item: Kurse) => {
    setEditingItem(item);
    setFormData({
      titel: item.fields.titel || '',
      beschreibung: item.fields.beschreibung || '',
      startdatum: item.fields.startdatum || '',
      enddatum: item.fields.enddatum || '',
      max_teilnehmer: item.fields.max_teilnehmer?.toString() || '',
      preis: item.fields.preis?.toString() || '',
      dozent: extractRecordId(item.fields.dozent) || '',
      raum: extractRecordId(item.fields.raum) || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      titel: '',
      beschreibung: '',
      startdatum: '',
      enddatum: '',
      max_teilnehmer: '',
      preis: '',
      dozent: '',
      raum: '',
    });
  };

  const getDozentName = (url: string | undefined) => {
    if (!url) return 'N/A';
    const id = extractRecordId(url);
    const dozent = dozenten.find((d) => d.record_id === id);
    return dozent?.fields.name || 'N/A';
  };

  const getRaumName = (url: string | undefined) => {
    if (!url) return 'N/A';
    const id = extractRecordId(url);
    const raum = raeume.find((r) => r.record_id === id);
    return raum?.fields.raumname || 'N/A';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kurse</h2>
          <p className="text-muted-foreground">Verwalte alle Kurse und ihre Details</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Kurs hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kurse.map((kurs) => (
          <div
            key={kurs.record_id}
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <GraduationCap className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{kurs.fields.titel}</h3>
                  <p className="text-sm text-muted-foreground">mit {getDozentName(kurs.fields.dozent)}</p>
                </div>
              </div>
            </div>
            {kurs.fields.beschreibung && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {kurs.fields.beschreibung}
              </p>
            )}
            <div className="space-y-2 mb-4 text-sm">
              {kurs.fields.startdatum && kurs.fields.enddatum && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>
                    {format(new Date(kurs.fields.startdatum), 'dd.MM.yy', { locale: de })} -{' '}
                    {format(new Date(kurs.fields.enddatum), 'dd.MM.yy', { locale: de })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span>Max. {kurs.fields.max_teilnehmer} Teilnehmer</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Euro className="size-4" />
                <span>{kurs.fields.preis?.toFixed(2)} €</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(kurs)}>
                <Edit className="size-3" />
                Bearbeiten
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(kurs.record_id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {kurse.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Noch keine Kurse vorhanden. Füge den ersten Kurs hinzu!
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
            <DialogDescription>
              Füge einen neuen Kurs hinzu oder bearbeite die Daten.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titel">Titel *</Label>
                <Input
                  id="titel"
                  value={formData.titel}
                  onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beschreibung">Beschreibung</Label>
                <Textarea
                  id="beschreibung"
                  value={formData.beschreibung}
                  onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startdatum">Startdatum *</Label>
                  <Input
                    id="startdatum"
                    type="date"
                    value={formData.startdatum}
                    onChange={(e) => setFormData({ ...formData, startdatum: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enddatum">Enddatum *</Label>
                  <Input
                    id="enddatum"
                    type="date"
                    value={formData.enddatum}
                    onChange={(e) => setFormData({ ...formData, enddatum: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_teilnehmer">Max. Teilnehmer *</Label>
                  <Input
                    id="max_teilnehmer"
                    type="number"
                    value={formData.max_teilnehmer}
                    onChange={(e) => setFormData({ ...formData, max_teilnehmer: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preis">Preis (€) *</Label>
                  <Input
                    id="preis"
                    type="number"
                    step="0.01"
                    value={formData.preis}
                    onChange={(e) => setFormData({ ...formData, preis: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dozent">Dozent *</Label>
                <Select value={formData.dozent} onValueChange={(v) => setFormData({ ...formData, dozent: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dozent auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {dozenten.map((d) => (
                      <SelectItem key={d.record_id} value={d.record_id}>
                        {d.fields.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="raum">Raum *</Label>
                <Select value={formData.raum} onValueChange={(v) => setFormData({ ...formData, raum: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Raum auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {raeume.map((r) => (
                      <SelectItem key={r.record_id} value={r.record_id}>
                        {r.fields.raumname} ({r.fields.gebaeude})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        title="Kurs löschen"
        description="Möchtest du diesen Kurs wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
      />
    </div>
  );
}
