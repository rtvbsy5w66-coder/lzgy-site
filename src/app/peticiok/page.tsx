"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  Target, 
  Calendar, 
  Search, 
  Filter,
  PenTool,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { Petition, PetitionCategory } from "@/types/petition";

const PetitionsListPage = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [categories, setCategories] = useState<PetitionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const colors = useThemeColors();
  const { data: session } = useSession();

  useEffect(() => {
    fetchPetitions();
    fetchCategories();
  }, [selectedCategory, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPetitions = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/petitions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch petitions');
      const data = await response.json();
      setPetitions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/petitions/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const getProgressPercentage = (signatures: number, target: number) => {
    return Math.min((signatures / target) * 100, 100);
  };

  const formatSignatureCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getStatusBadge = (petition: Petition) => {
    if (petition.status === 'ACTIVE') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <PenTool className="h-3 w-3 mr-1" />
          Aktív
        </Badge>
      );
    }
    if (petition.status === 'CLOSED') {
      return (
        <Badge className="bg-red-100 text-red-800">
          <Clock className="h-3 w-3 mr-1" />
          Lezárt
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800">
        {petition.status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Petíciók
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Csatlakozzon közösségünkhöz és támogassa a változást! Írja alá petícióinkat vagy indítson új kezdeményezést.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Keresés petíciók között..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Minden kategória</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="max-w-md mx-auto mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">Hiba történt: {error}</p>
              <Button onClick={fetchPetitions}>
                Újratöltés
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && petitions.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Még nincsenek elérhető petíciók</h3>
              <p className="text-gray-600 dark:text-gray-400">Hamarosan új petíciókkal bővítjük a kínálatunkat!</p>
            </CardContent>
          </Card>
        )}

        {/* Petitions Grid */}
        {!error && petitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petitions.map((petition) => {
              const signatureCount = petition._count?.signatures || 0;
              const progressPercentage = getProgressPercentage(signatureCount, petition.targetGoal);
              const hasSigned = (petition as any).hasSigned;
              
              return (
                <Card key={petition.id} className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {petition.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getStatusBadge(petition)}
                          
                          {(petition as any).hasSigned && session?.user && (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Aláírta
                            </Badge>
                          )}
                          
                          {petition.category && (
                            <Badge 
                              
                              style={{ borderColor: petition.category.color }}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {petition.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {petition.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{formatSignatureCount(signatureCount)} aláírás</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Target className="h-4 w-4" />
                            <span>{formatSignatureCount(petition.targetGoal)} cél</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${progressPercentage}%`,
                              background: colors.gradient
                            }}
                          ></div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          {progressPercentage.toFixed(1)}% teljesítve
                        </div>
                      </div>

                      {/* User's signature info */}
                      {hasSigned && (petition as any).userSignature && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Ön aláírta ezt a petíciót
                            </span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Aláírva: {new Date((petition as any).userSignature.signedAt).toLocaleDateString('hu-HU')}
                          </p>
                          {(petition as any).userSignature.status === 'PENDING_VERIFICATION' && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              ⏳ Email megerősítés függőben
                            </p>
                          )}
                        </div>
                      )}

                      {/* Time Information */}
                      {petition.endDate && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Határidő: {new Date(petition.endDate).toLocaleDateString('hu-HU')}
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-4 border-t">
                        <Link href={`/peticiok/${petition.id}`}>
                          <Button 
                            className="w-full group-hover:scale-105 transition-transform"
                            style={{ 
                              background: hasSigned ? '#10b981' : petition.status === 'ACTIVE' ? colors.gradient : '#6b7280',
                              color: 'white'
                            }}
                            disabled={petition.status !== 'ACTIVE' && !hasSigned}
                          >
                            {hasSigned ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Eredmények megtekintése
                              </>
                            ) : (
                              <>
                                <PenTool className="h-4 w-4 mr-2" />
                                {petition.status === 'ACTIVE' ? 'Aláírás' : 
                                 petition.status === 'CLOSED' ? 'Eredmények megtekintése' : 
                                 'Részletek'}
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {!error && petitions.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto" style={{ borderColor: colors.accent }}>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Új petíció indítása</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Van egy fontos ügy, amit szeretne támogatni? Lépjen kapcsolatba velünk új petíció indításához!
                </p>
                <Link href="/kapcsolat">
                  <Button 
                    style={{ background: colors.gradient, color: 'white' }}
                    className="hover:opacity-90 transition-opacity"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Petíció javaslása
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetitionsListPage;