"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  RefreshCw, 
  BarChart3, 
  Users, 
  Shield,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useThemeColors } from '@/context/ThemeContext';
import InteractiveParticipationFlow from '@/components/InteractiveParticipationFlow';

const InteractiveParticipationDemo = () => {
  const colors = useThemeColors();
  const [demoMode, setDemoMode] = useState<'overview' | 'petition' | 'poll'>('overview');
  const [results, setResults] = useState<any>(null);

  const demoData = {
    petition: {
      id: 'demo-petition-1',
      title: 'Zöld Energia Támogatása a Közintézményekben',
      description: 'Kezdeményezzük, hogy minden állami intézmény térjen át megújuló energiaforrásokra a következő 5 évben.',
    },
    poll: {
      id: 'demo-poll-1',
      title: 'Melyik közlekedési fejlesztést tartja legfontosabbnak Budapest számára?',
      description: 'Segítsen meghatározni a következő városi közlekedési beruházás prioritásait.',
      options: [
        {
          id: 'option-1',
          text: 'Több kerékpárút építése',
          description: 'Biztonságos kerékpárút-hálózat kiépítése a város egészében'
        },
        {
          id: 'option-2',
          text: 'Metró vonalak bővítése',
          description: 'Új metróvonalak és állomások építése a külvárosokban'
        },
        {
          id: 'option-3',
          text: 'Elektromos buszok',
          description: 'A teljes buszflotta cseréje elektromos járművekre'
        },
        {
          id: 'option-4',
          text: 'Közösségi autómegosztás',
          description: 'Városi autómegosztó rendszer kiépítése'
        }
      ]
    }
  };

  const handleSuccess = (result: any) => {
    setResults(result);
    console.log('Demo participation success:', result);
  };

  const handleError = (error: string) => {
    console.error('Demo participation error:', error);
  };

  const resetDemo = () => {
    setResults(null);
  };

  if (demoMode !== 'overview') {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <Button 
            onClick={() => setDemoMode('overview')}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Vissza a Demóhoz
          </Button>
        </div>
        
        {demoMode === 'petition' && (
          <InteractiveParticipationFlow
            type="petition"
            id={demoData.petition.id}
            title={demoData.petition.title}
            description={demoData.petition.description}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
        
        {demoMode === 'poll' && (
          <InteractiveParticipationFlow
            type="poll"
            id={demoData.poll.id}
            title={demoData.poll.title}
            description={demoData.poll.description}
            options={demoData.poll.options}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div 
              className="p-6 rounded-full"
              style={{ background: colors.gradient }}
            >
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Kétlépcsős Interakciós Modell - Demó
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tesztelje az új részvételi funkciót, amely lehetővé teszi mind az anonim, 
            mind a regisztrált részvételt petíciókban és szavazásokban.
          </p>
        </div>

        {/* Results Display */}
        {results && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                Demó Eredmény
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
              <Button 
                onClick={resetDemo}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Új Demó Indítása
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Demo Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Petition Demo */}
          <Card className="hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: colors.accent }} />
                Petíció Demó
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{demoData.petition.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {demoData.petition.description}
                </p>
              </div>
              
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Anonim aláírás lehetősége
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Regisztrált aláírás email megerősítéssel
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Adatvédelmi beállítások
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  GDPR megfelelőség
                </div>
              </div>

              <Button 
                onClick={() => setDemoMode('petition')}
                className="w-full text-white"
                style={{ background: colors.gradient }}
              >
                <Play className="h-4 w-4 mr-2" />
                Petíció Demó Indítása
              </Button>
            </CardContent>
          </Card>

          {/* Poll Demo */}
          <Card className="hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: colors.accent }} />
                Szavazás Demó
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{demoData.poll.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {demoData.poll.description}
                </p>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {demoData.poll.options.length} szavazási lehetőség
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Anonim szavazás session-alapú követéssel
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Regisztrált szavazás email címmel
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Azonnali eredmények
                </div>
              </div>

              <Button 
                onClick={() => setDemoMode('poll')}
                className="w-full text-white"
                style={{ background: colors.gradient }}
              >
                <Play className="h-4 w-4 mr-2" />
                Szavazás Demó Indítása
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Funkció Áttekintés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" style={{ color: colors.accent }} />
                  Anonim Részvétel
                </h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Azonnali részvétel</li>
                  <li>• Teljes adatvédelem</li>
                  <li>• Session-alapú követés</li>
                  <li>• 30 napos automatikus törlés</li>
                  <li>• Opcionális demográfiai adatok</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: colors.accent }} />
                  Regisztrált Részvétel
                </h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Email megerősítés</li>
                  <li>• Hírlevel feliratkozás</li>
                  <li>• Hosszú távú kapcsolat</li>
                  <li>• Frissítések és értesítések</li>
                  <li>• Nagyobb hitelesség</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" style={{ color: colors.accent }} />
                  Analitika és Insights
                </h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Konverziós ráta követés</li>
                  <li>• Engagement metrikák</li>
                  <li>• Demográfiai elemzés</li>
                  <li>• Időbeli trendek</li>
                  <li>• GDPR megfelelő adatkezelés</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Technikai Részletek
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Adatbázis Séma</h4>
                <ul className="text-sm space-y-1">
                  <li>• <code>isAnonymous</code> flag az aláírásoknál</li>
                  <li>• <code>sessionId</code> anonim követéshez</li>
                  <li>• <code>participationType</code> enum</li>
                  <li>• Nullable személyes adatok</li>
                  <li>• Automatikus indexek</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">API Végpontok</h4>
                <ul className="text-sm space-y-1">
                  <li>• <code>/api/petitions/[id]/sign-anonymous</code></li>
                  <li>• <code>/api/polls/[id]/vote-anonymous</code></li>
                  <li>• <code>/api/admin/privacy-cleanup</code></li>
                  <li>• <code>/api/admin/analytics</code></li>
                  <li>• Biztonsági middleware minden végponton</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveParticipationDemo;