import { useState, useEffect } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Dozenten } from '@/types/app';
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
import { Plus, Edit, Trash2, UserCheck, Mail, Phone } from 'lucide-react';

export function DozentenTab() {
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Dozenten | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefon: '',
    fachgebiet: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await LivingAppsService.getDozenten();
      setDozenten(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await LivingAppsService.updateDozentenEntry(editingItem.record_id, formData);
      } else {
        await LivingAppsService.createDozentenEntry(formData);
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
      await LivingAppsService.deleteDozentenEntry(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditDialog = (item: Dozenten) => {
    setEditingItem(item);
    setFormData({
      name: item.fields.name || '',
      email: item.fields.email || '',
      telefon: item.fields.telefon || '',
      fachgebiet: item.fields.fachgebiet || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ name: '', email: '', telefon: '', fachgebiet: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dozenten</h2>
          <p className="text-muted-foreground">Verwalte alle Dozenten und ihre Fachgebiete</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Dozent hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dozenten.map((dozent) => (
          <div
            key={dozent.record_id}
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <UserCheck className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{dozent.fields.name}</h3>
                  {dozent.fields.fachgebiet && (
                    <p className="text-sm text-muted-foreground">{dozent.fields.fachgebiet}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              {dozent.fields.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  <span>{dozent.fields.email}</span>
                </div>
              )}
              {dozent.fields.telefon && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4" />
                  <span>{dozent.fields.telefon}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(dozent)}>
                <Edit className="size-3" />
                Bearbeiten
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(dozent.record_id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {dozenten.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Noch keine Dozenten vorhanden. Füge den ersten Dozent hinzu!
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
            <DialogDescription>
              Füge einen neuen Dozenten hinzu oder bearbeite die Daten.
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
                <Label htmlFor="fachgebiet">Fachgebiet</Label>
                <Input
                  id="fachgebiet"
                  value={formData.fachgebiet}
                  onChange={(e) => setFormData({ ...formData, fachgebiet: e.target.value })}
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
        title="Dozent löschen"
        description="Möchtest du diesen Dozenten wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
      />
    </div>
  );
}
