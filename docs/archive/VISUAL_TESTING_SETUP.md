# Visual Regression Testing Setup

## Overview
Ez a projekt Storybook és Chromatic-ot használ vizuális regressziós tesztelésre, amely automatikusan detektálja a UI komponensek vizuális változásait.

## Setup Steps

### 1. Chromatic Account és Project
1. Regisztrálj a [Chromatic.com](https://chromatic.com) oldalon
2. Hozz létre egy új projektet
3. Másold ki a projekt token-t

### 2. Environment Variables
Állítsd be a következő environment változókat:

#### Local Development (.env.local)
```bash
CHROMATIC_PROJECT_TOKEN=your_project_token_here
```

#### GitHub Secrets
A GitHub repository-ban állítsd be a következő secret-et:
- `CHROMATIC_PROJECT_TOKEN`: A Chromatic projekt token

### 3. Available Scripts

```bash
# Storybook fejlesztési server indítása
npm run storybook

# Storybook build (production)
npm run build-storybook

# Chromatic visual test futtatása (minden komponens)
npm run chromatic

# Chromatic test csak megváltozott komponensekre
npm run test:visual
```

## Automated Testing

### GitHub Actions
- **Trigger**: Push-ra és Pull Request-re a main branch-re
- **Process**: 
  1. Dependencies telepítése
  2. Prisma client generálása
  3. Chromatic visual diff futtatása
  4. Eredmények Chromatic dashboard-ban

### Visual Diff Detection
- **Light/Dark theme támogatás**: Automatikus
- **Responsive testing**: Mobile, tablet, desktop viewportok
- **Accessibility checks**: Beépített a11y validáció
- **Only changed detection**: Csak módosított komponensek tesztelése

## Story Coverage

### Jelenleg lefedett komponensek:
- ✅ **ProgramCards**: Program kártyák megjelenítése (light/dark theme)
- ✅ **HirekSzekcio**: Hírek szekció (light/dark theme)
- ✅ **ContactForm**: Kapcsolati űrlap (light/dark theme)  
- ✅ **Navigation**: Navigációs menü (responsive + theme)
- ✅ **ThemeToggle**: Téma váltó gomb (light/dark states)

### Következő fázisban lefedendő:
- 🔄 **EventsSection**: Események megjelenítése
- 🔄 **HeroSlider**: Főoldali slider
- 🔄 **AdminComponents**: Admin felület komponensei

## Theme Integration

A visual tesztek automatikusan tesztelik:
- **Light mode**: Világos téma variáns
- **Dark mode**: Sötét téma variáns  
- **Theme transitions**: Témaváltás során vizuális konzisztencia
- **Component isolation**: Komponensek önálló theme működése

## Workflow

### Development
1. Komponens módosítása
2. Story frissítése (ha szükséges)
3. `npm run storybook` - lokális ellenőrzés
4. Commit & Push
5. Chromatic automatikus futtatása
6. Visual review a Chromatic dashboard-ban

### Approval Process
1. PR létrehozása
2. Chromatic visual diff review
3. Változások jóváhagyása Chromatic-ban
4. PR merge

## Best Practices

### Story Writing
- **Isolate components**: Minden story önállóan működjön
- **Cover key states**: Loading, error, success, dark/light
- **Use realistic data**: Valósághű mock adatok
- **Document interactions**: User interakciók lefedése

### Visual Stability
- **Consistent data**: Stabil mock adatok használata
- **Fixed dimensions**: Statikus méretek ahol lehetséges
- **Avoid animations**: Animációk kikapcsolása tesztekhez
- **Loading states**: Loading állapotok kezelése

## Troubleshooting

### Common Issues
1. **Theme provider missing**: Story-k ThemeProvider wrapper-rel
2. **API calls failing**: Mock-olt API response-ok használata  
3. **Dynamic content**: Time-based tartalom rögzítése
4. **Font loading**: Web fontok preload-olása

### Debug Commands
```bash
# Storybook debug build
npm run build-storybook -- --debug

# Chromatic debug run
npx chromatic --debug

# Story-specific test
npx chromatic --only-story-names="Components/ThemeToggle/*"
```

## Configuration Files

- `.storybook/main.ts`: Storybook konfiguráció
- `.storybook/preview.tsx`: Global decorators és parameters
- `.chromatic.yml`: Chromatic project konfiguráció
- `.github/workflows/chromatic.yml`: CI/CD pipeline

## Dashboard Access
A vizuális tesztek eredményei itt elérhetők:
- Chromatic Dashboard: `https://chromatic.com/builds?appId=your_project_id`
- Storybook Deploy: `https://your_project_id.chromatic.com/`