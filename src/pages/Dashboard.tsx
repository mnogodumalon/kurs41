import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, UserCheck, Building2, ClipboardCheck } from 'lucide-react';
import { KurseTab } from '@/components/tabs/KurseTab';
import { DozentenTab } from '@/components/tabs/DozentenTab';
import { TeilnehmerTab } from '@/components/tabs/TeilnehmerTab';
import { RaeumeTab } from '@/components/tabs/RaeumeTab';
import { AnmeldungenTab } from '@/components/tabs/AnmeldungenTab';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('kurse');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Kursverwaltung
          </h1>
          <p className="text-muted-foreground text-lg">
            Verwalte deine Kurse, Dozenten, Teilnehmer und Räume an einem Ort
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="kurse" className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              <span className="hidden sm:inline">Kurse</span>
            </TabsTrigger>
            <TabsTrigger value="anmeldungen" className="flex items-center gap-2">
              <ClipboardCheck className="size-4" />
              <span className="hidden sm:inline">Anmeldungen</span>
            </TabsTrigger>
            <TabsTrigger value="dozenten" className="flex items-center gap-2">
              <UserCheck className="size-4" />
              <span className="hidden sm:inline">Dozenten</span>
            </TabsTrigger>
            <TabsTrigger value="teilnehmer" className="flex items-center gap-2">
              <Users className="size-4" />
              <span className="hidden sm:inline">Teilnehmer</span>
            </TabsTrigger>
            <TabsTrigger value="raeume" className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span className="hidden sm:inline">Räume</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kurse">
            <KurseTab />
          </TabsContent>
          <TabsContent value="anmeldungen">
            <AnmeldungenTab />
          </TabsContent>
          <TabsContent value="dozenten">
            <DozentenTab />
          </TabsContent>
          <TabsContent value="teilnehmer">
            <TeilnehmerTab />
          </TabsContent>
          <TabsContent value="raeume">
            <RaeumeTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
