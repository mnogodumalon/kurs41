import { useState, useEffect } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Raeume } from '@/types/app';
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
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

export function RaeumeTab() {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Raeume | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    raumname: '',
    gebaeude: '',
    kapazitaet: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await LivingAppsService.getRaeume();
      setRaeume(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await LivingAppsService.updateRaeumeEntry(editingItem.record_id, {
          raumname: formData.raumname,
          gebaeude: formData.gebaeude,
          kapazitaet: Number(formData.kapazitaet),
        });
      } else {
        await LivingAppsService.createRaeumeEntry({
          raumname: formData.raumname,
          gebaeude: formData.gebaeude,
          kapazitaet: Number(formData.kapazitaet),
        });
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
      await LivingAppsService.deleteRaeumeEntry(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditDialog = (item: Raeume) => {
    setEditingItem(item);
    setFormData({
      raumname: item.fields.raumname || '',
      gebaeude: item.fields.gebaeude || '',
      kapazitaet: item.fields.kapazitaet?.toString() || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ raumname: '', gebaeude: '', kapazitaet: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Räume</h2>
          <p className="text-muted-foreground">Verwalte alle Räume und deren Kapazitäten</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Raum hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {raeume.map((raum) => (
          <div
            key={raum.record_id}
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Building2 className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{raum.fields.raumname}</h3>
                  <p className="text-sm text-muted-foreground">{raum.fields.gebaeude}</p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Kapazität</p>
              <p className="text-xl font-bold text-primary">{raum.fields.kapazitaet} Personen</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(raum)}>
                <Edit className="size-3" />
                Bearbeiten
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(raum.record_id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {raeume.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Noch keine Räume vorhanden. Füge den ersten Raum hinzu!
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
            <DialogDescription>
              Füge einen neuen Raum hinzu oder bearbeite die Daten.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="raumname">Raumname *</Label>
                <Input
                  id="raumname"
                  value={formData.raumname}
                  onChange={(e) => setFormData({ ...formData, raumname: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gebaeude">Gebäude *</Label>
                <Input
                  id="gebaeude"
                  value={formData.gebaeude}
                  onChange={(e) => setFormData({ ...formData, gebaeude: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kapazitaet">Kapazität *</Label>
                <Input
                  id="kapazitaet"
                  type="number"
                  value={formData.kapazitaet}
                  onChange={(e) => setFormData({ ...formData, kapazitaet: e.target.value })}
                  required
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
        title="Raum löschen"
        description="Möchtest du diesen Raum wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
      />
    </div>
  );
}
