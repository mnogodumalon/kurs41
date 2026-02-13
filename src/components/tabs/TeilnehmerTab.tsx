import { useState, useEffect } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Teilnehmer } from '@/types/app';
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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function TeilnehmerTab() {
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Teilnehmer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefon: '',
    geburtsdatum: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await LivingAppsService.getTeilnehmer();
      setTeilnehmer(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        telefon: formData.telefon || undefined,
        geburtsdatum: formData.geburtsdatum || undefined,
      };
      if (editingItem) {
        await LivingAppsService.updateTeilnehmerEntry(editingItem.record_id, payload);
      } else {
        await LivingAppsService.createTeilnehmerEntry(payload);
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
      await LivingAppsService.deleteTeilnehmerEntry(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditDialog = (item: Teilnehmer) => {
    setEditingItem(item);
    setFormData({
      name: item.fields.name || '',
      email: item.fields.email || '',
      telefon: item.fields.telefon || '',
      geburtsdatum: item.fields.geburtsdatum || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ name: '', email: '', telefon: '', geburtsdatum: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teilnehmer</h2>
          <p className="text-muted-foreground">Verwalte alle Kursteilnehmer</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Teilnehmer hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teilnehmer.map((tn) => (
          <div
            key={tn.record_id}
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <User className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{tn.fields.name}</h3>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              {tn.fields.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  <span className="truncate">{tn.fields.email}</span>
                </div>
              )}
              {tn.fields.telefon && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4" />
                  <span>{tn.fields.telefon}</span>
                </div>
              )}
              {tn.fields.geburtsdatum && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>{format(new Date(tn.fields.geburtsdatum), 'dd. MMM yyyy', { locale: de })}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(tn)}>
                <Edit className="size-3" />
                Bearbeiten
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(tn.record_id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {teilnehmer.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Noch keine Teilnehmer vorhanden. Füge den ersten Teilnehmer hinzu!
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
            <DialogDescription>
              Füge einen neuen Teilnehmer hinzu oder bearbeite die Daten.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geburtsdatum">Geburtsdatum</Label>
                <Input
                  id="geburtsdatum"
                  type="date"
                  value={formData.geburtsdatum}
                  onChange={(e) => setFormData({ ...formData, geburtsdatum: e.target.value })}
                />
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
        title="Teilnehmer löschen"
        description="Möchtest du diesen Teilnehmer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
      />
    </div>
  );
}
