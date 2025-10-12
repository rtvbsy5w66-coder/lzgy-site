"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  Shield, 
  Mail, 
  Clock, 
  Eye, 
  Users,
  Zap,
  Heart,
  CheckCircle
} from 'lucide-react';
import { useThemeColors } from '@/context/ThemeContext';
import { ParticipationChoice as ParticipationChoiceType } from '@/types/participation';

interface ParticipationChoiceProps {
  onChoice: (type: 'ANONYMOUS' | 'REGISTERED') => void;
  title: string;
  description: string;
  type: 'petition' | 'poll' | 'quiz';
  session?: any;
  onLogin?: () => void;
}

const ParticipationChoice: React.FC<ParticipationChoiceProps> = ({
  onChoice,
  title,
  description,
  type,
  session,
  onLogin
}) => {
  const colors = useThemeColors();

  const choices: ParticipationChoiceType[] = [
    {
      type: 'ANONYMOUS',
      label: 'Gyors Részvétel',
      description: 'Anonim részvétel személyes adatok megadása nélkül',
      benefits: [
        'Azonnali részvétel',
        'Teljes adatvédelem',
        'Nincs email megerősítés',
        'Nincs spam vagy értesítés'
      ],
      icon: 'shield'
    },
    {
      type: 'REGISTERED',
      label: 'Regisztrált Részvétel',
      description: 'Részvétel kapcsolattartási adatok megadásával',
      benefits: [
        'Hírlevel feliratkozás',
        'Frissítések az eredményekről',
        'Jövőbeli eseményekről értesítés',
        'Nagyobb hatás és hitelesség'
      ],
      icon: 'userCheck'
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <Shield className="h-8 w-8" />;
      case 'userCheck':
        return <UserCheck className="h-8 w-8" />;
      default:
        return <Users className="h-8 w-8" />;
    }
  };

  const getActionText = () => {
    if (type === 'petition') return 'aláírja';
    if (type === 'poll') return 'szavaz';
    return 'kitölti';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="p-4 rounded-full"
              style={{ background: colors.gradient }}
            >
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Hogyan szeretne részt venni?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Válassza ki, hogy hogyan szeretné {getActionText()} ezt a {type === 'petition' ? 'petíciót' : type === 'poll' ? 'szavazást' : 'kvízt'}. 
            Mindkét lehetőség biztonságos és egyenértékű.
          </p>
        </div>

        {/* Login Prompt for Returning Users */}
        {!session && onLogin && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Már regisztrált korábban?</p>
                    <p className="text-sm text-blue-700">Jelentkezzen be az adatai automatikus kitöltéséhez</p>
                  </div>
                </div>
                <Button 
                  onClick={onLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Bejelentkezés
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logged in User Info */}
        {session?.user && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Bejelentkezve mint: {session.user.name}</p>
                  <p className="text-sm text-green-700">Adatai automatikusan ki lesznek töltve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Petition/Poll Title */}
        <Card className="mb-8 border-l-4" style={{ borderLeftColor: colors.accent }}>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </CardContent>
        </Card>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {choices.map((choice) => (
            <Card 
              key={choice.type}
              className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-opacity-50"
              style={{ borderColor: choice.type === 'ANONYMOUS' ? '#6b7280' : colors.accent }}
              onClick={() => onChoice(choice.type)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div 
                    className="p-4 rounded-full group-hover:scale-110 transition-transform"
                    style={{ 
                      background: choice.type === 'ANONYMOUS' 
                        ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                        : colors.gradient 
                    }}
                  >
                    {getIcon(choice.icon)}
                    <span className="text-white">{/* Icon will be rendered here */}</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{choice.label}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {choice.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {choice.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle 
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: choice.type === 'ANONYMOUS' ? '#6b7280' : colors.accent }}
                      />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full text-white font-medium"
                  style={{ 
                    background: choice.type === 'ANONYMOUS' 
                      ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                      : colors.gradient 
                  }}
                  onClick={() => onChoice(choice.type)}
                >
                  {choice.type === 'ANONYMOUS' ? (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Gyors Részvétel
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Regisztráció
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy Notice */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Adatvédelmi Tájékoztató
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  Mindkét részvételi forma teljes mértékben megfelel a GDPR előírásoknak. 
                  Az anonim részvétel esetén semmilyen személyes adatot nem tárolunk. 
                  A regisztrált részvétel esetén csak az Ön által megadott adatokat kezeljük, 
                  és bármikor kérheti azok törlését.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Átlátható adatkezelés
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    30 napos automatikus törlés (anonim)
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Spam-mentes kommunikáció
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipationChoice;