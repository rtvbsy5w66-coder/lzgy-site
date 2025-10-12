import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const quizData = {
  "quizzes": [
    {
      "title": "Zöld Megállapodás Kvíz",
      "description": "Az EU klímasemlegesség felé tart! Teszteld tudásod a Green Deal-ről, a Fit for 55 csomagról és a fenntartható jövőről.",
      "category": "Környezetvédelem",
      "difficulty": "HARD",
      "timeLimit": 25,
      "maxAttempts": 2,
      "isPublic": true,
      "showResults": true,
      "status": "PUBLISHED",
      "questions": [
        {
          "question": "Hány százalékkal kell csökkenteni az üvegházhatású gázok kibocsátását 2030-ig az 1990-es szinthez képest?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 1,
          "explanation": "Az EU 'Fit for 55' csomagja legalább 55%-os nettó üvegházhatásúgáz-kibocsátás csökkentést ír elő 2030-ra az 1990-es szinthez képest. Forrás: European Council (2023), Fit for 55.",
          "options": [
            {"text": "40%", "isCorrect": false, "order": 1},
            {"text": "45%", "isCorrect": false, "order": 2},
            {"text": "55%", "isCorrect": true, "order": 3},
            {"text": "65%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mikor kell elérni az EU-nak a teljes klímasemlegességet?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 2,
          "explanation": "Az Európai Zöld Megállapodás célja a teljes klímasemlegesség elérése 2050-re. Forrás: European Commission, European Green Deal.",
          "options": [
            {"text": "2040", "isCorrect": false, "order": 1},
            {"text": "2045", "isCorrect": false, "order": 2},
            {"text": "2050", "isCorrect": true, "order": 3},
            {"text": "2060", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány százalékkal kell csökkenteni a kibocsátást az EU ETS szektorokban 2030-ig a 2005-ös szinthez képest?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 3,
          "explanation": "Az EU Emissions Trading System (ETS) szektoraiban 61%-os kibocsátás-csökkentés szükséges 2030-ig a 2005-ös szinthez képest. Forrás: European Council (2023).",
          "options": [
            {"text": "40%", "isCorrect": false, "order": 1},
            {"text": "50%", "isCorrect": false, "order": 2},
            {"text": "61%", "isCorrect": true, "order": 3},
            {"text": "75%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány millió tonna CO2-egyenértékű nettó eltávolítás a LULUCF célja 2030-ra?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 4,
          "explanation": "A földhasználat, földhasználat-változás és erdőgazdálkodás (LULUCF) szektorban legalább 310 millió tonna CO2-egyenérték nettó eltávolítás a cél 2030-ra. Forrás: European Council (2023).",
          "options": [
            {"text": "150 millió tonna", "isCorrect": false, "order": 1},
            {"text": "250 millió tonna", "isCorrect": false, "order": 2},
            {"text": "310 millió tonna", "isCorrect": true, "order": 3},
            {"text": "500 millió tonna", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mikortól tiltják be az új belső égésű motorral hajtott autók értékesítését az EU-ban?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 5,
          "explanation": "2035-től az új személygépkocsik és kisteherautók 100%-os kibocsátás-csökkentési célja gyakorlatilag betiltja az új belső égésű motorok értékesítését. Forrás: European Council (2023).",
          "options": [
            {"text": "2030", "isCorrect": false, "order": 1},
            {"text": "2032", "isCorrect": false, "order": 2},
            {"text": "2035", "isCorrect": true, "order": 3},
            {"text": "2040", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány százalékkal csökkent az EU üvegházhatású gáz kibocsátása 2023-ban az előző évhez képest?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 6,
          "explanation": "Az EU 8%-os nettó csökkenést ért el 2023-ban az üvegházhatású gázok kibocsátásában - az évtizedek legnagyobb éves csökkenése (a 2020-as pandémiás év kivételével). Forrás: European Environment Agency (2024).",
          "options": [
            {"text": "3%", "isCorrect": false, "order": 1},
            {"text": "5%", "isCorrect": false, "order": 2},
            {"text": "8%", "isCorrect": true, "order": 3},
            {"text": "12%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Átlagosan hány millió tonna CO2-egyenértékkel kell csökkenteni a kibocsátást évente 2024-2030 között?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 7,
          "explanation": "2024 és 2030 között átlagosan évi 134 millió tonna CO2-egyenértékkel kell csökkenteni a kibocsátást (kb. 2,8 százalékpont az 1990-es kibocsátáshoz képest). Forrás: European Environment Agency (2024).",
          "options": [
            {"text": "75 millió tonna", "isCorrect": false, "order": 1},
            {"text": "100 millió tonna", "isCorrect": false, "order": 2},
            {"text": "134 millió tonna", "isCorrect": true, "order": 3},
            {"text": "200 millió tonna", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány százalékkal voltak alacsonyabbak az EU nettó kibocsátásai 2020-ban az 1990-es szinthez képest?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 8,
          "explanation": "Az EU nettó kibocsátásai 2020-ban 34%-kal alacsonyabbak voltak az 1990-es szinthez képest. Forrás: European Environment Agency (2024).",
          "options": [
            {"text": "20%", "isCorrect": false, "order": 1},
            {"text": "27%", "isCorrect": false, "order": 2},
            {"text": "34%", "isCorrect": true, "order": 3},
            {"text": "42%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Minimum hány százalékos megújuló energia részarány a cél 2030-ra?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 9,
          "explanation": "A felülvizsgált Megújuló Energia Irányelv minimum 42,5%-os megújuló energia részarányt ír elő 2030-ra, 45%-os törekvési célkitűzéssel. Forrás: European Commission (2023), Renewable Energy Directive.",
          "options": [
            {"text": "32%", "isCorrect": false, "order": 1},
            {"text": "38%", "isCorrect": false, "order": 2},
            {"text": "42,5%", "isCorrect": true, "order": 3},
            {"text": "50%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU energetikai szektor hány százalékáért felelős az EU üvegházhatású gáz kibocsátásainak?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 10,
          "explanation": "Az energetikai szektor az EU üvegházhatású gáz kibocsátásainak több mint 75%-áért felelős. Forrás: European Commission (2023).",
          "options": [
            {"text": "50%", "isCorrect": false, "order": 1},
            {"text": "65%", "isCorrect": false, "order": 2},
            {"text": "75%+", "isCorrect": true, "order": 3},
            {"text": "85%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mennyi éves befektetés szükséges az energiarendszerbe 2021-2030 között?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 11,
          "explanation": "Az EU-nak évente becsült 570 milliárd eurós energiarendszer-befektetésre van szüksége 2021-2030 között a megújuló energiára, hálózat-fejlesztésre, épület-felújításra. Forrás: OECD (2023).",
          "options": [
            {"text": "300 milliárd euró", "isCorrect": false, "order": 1},
            {"text": "450 milliárd euró", "isCorrect": false, "order": 2},
            {"text": "570 milliárd euró", "isCorrect": true, "order": 3},
            {"text": "750 milliárd euró", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mennyi fenntartható befektetést céloz meg a Green Deal Investment Plan az évtizedben?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 12,
          "explanation": "Az EU Green Deal Investment Plan legalább 1 billió euró fenntartható befektetés mobilizálását célozza meg az évtized során. Forrás: European Commission, Green Deal Investment Plan.",
          "options": [
            {"text": "500 milliárd euró", "isCorrect": false, "order": 1},
            {"text": "750 milliárd euró", "isCorrect": false, "order": 2},
            {"text": "1 billió euró", "isCorrect": true, "order": 3},
            {"text": "2 billió euró", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány új munkahelyet teremthet a Fit for 55 klímacsomagja 2030-ra?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 13,
          "explanation": "A Fit for 55 klímacsomag várhatóan nettó 204 000 új munkahelyet teremt 2030-ra. Forrás: OECD (2023).",
          "options": [
            {"text": "100 000", "isCorrect": false, "order": 1},
            {"text": "204 000", "isCorrect": true, "order": 2},
            {"text": "350 000", "isCorrect": false, "order": 3},
            {"text": "500 000", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az európai lakóépületek közel hányad része épült 1970 előtt energiahatékonysági megfontolások nélkül?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 14,
          "explanation": "Az európai lakóépületek közel fele 1970 előtt épült, amikor még nem léteztek energiahatékonysági megfontolások. Forrás: OECD (2023).",
          "options": [
            {"text": "Egyharmada", "isCorrect": false, "order": 1},
            {"text": "Fele", "isCorrect": true, "order": 2},
            {"text": "Kétharmada", "isCorrect": false, "order": 3},
            {"text": "Háromnegyede", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU polgárok hány százaléka támogatta a megújuló energia növelését 2025-ben?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 15,
          "explanation": "A 2025 júniusi Eurobarométer felmérés szerint az EU polgárok 88%-a támogatta a megújuló energia telepítésének növelését. Forrás: Eurobarometer (2025).",
          "options": [
            {"text": "68%", "isCorrect": false, "order": 1},
            {"text": "75%", "isCorrect": false, "order": 2},
            {"text": "88%", "isCorrect": true, "order": 3},
            {"text": "95%", "isCorrect": false, "order": 4}
          ]
        }
      ]
    },
    {
      "title": "Euró Tudásteszt",
      "description": "Az euró a világ második legfontosabb valutája! Teszteld tudásod a közös pénzről, a csatlakozási feltételekről és az előnyökről.",
      "category": "Gazdaság",
      "difficulty": "HARD",
      "timeLimit": 25,
      "maxAttempts": 2,
      "isPublic": true,
      "showResults": true,
      "status": "PUBLISHED",
      "questions": [
        {
          "question": "Hány Maastrichti konvergencia kritériumnak kell megfelelni az euró bevezetéséhez?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 1,
          "explanation": "5 kritérium van: árstabilitás, költségvetési kritériumok (deficit és adósság), árfolyam-stabilitás, hosszú távú kamatlábak, és jogi konvergencia. Forrás: European Central Bank (2025).",
          "options": [
            {"text": "3 kritérium", "isCorrect": false, "order": 1},
            {"text": "4 kritérium", "isCorrect": false, "order": 2},
            {"text": "5 kritérium", "isCorrect": true, "order": 3},
            {"text": "7 kritérium", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az infláció maximum hány százalékponttal haladhatja meg a három legjobb teljesítményű ország átlagát?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 2,
          "explanation": "Az árstabilitási kritérium szerint az átlagos infláció 12 hónapon át nem haladhatja meg 1,5 százalékponttal a három legjobban teljesítő állam inflációját. Forrás: ECB (2025), Convergence criteria.",
          "options": [
            {"text": "0,5 százalékpont", "isCorrect": false, "order": 1},
            {"text": "1,0 százalékpont", "isCorrect": false, "order": 2},
            {"text": "1,5 százalékpont", "isCorrect": true, "order": 3},
            {"text": "2,5 százalékpont", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "A költségvetési hiány maximum hány százaléka lehet a GDP-nek?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 3,
          "explanation": "A költségvetési deficit nem haladhatja meg a GDP 3%-át a Maastrichti kritériumok szerint. Forrás: ECB (2025).",
          "options": [
            {"text": "2%", "isCorrect": false, "order": 1},
            {"text": "3%", "isCorrect": true, "order": 2},
            {"text": "5%", "isCorrect": false, "order": 3},
            {"text": "7%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az államadósság maximum hány százaléka lehet a GDP-nek?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 4,
          "explanation": "Az államadósság nem haladhatja meg a GDP 60%-át a Maastrichti kritériumok szerint. Forrás: ECB (2025).",
          "options": [
            {"text": "40%", "isCorrect": false, "order": 1},
            {"text": "50%", "isCorrect": false, "order": 2},
            {"text": "60%", "isCorrect": true, "order": 3},
            {"text": "80%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Minimum hány évig kell részt venni az ERM II mechanizmusban az euró bevezetése előtt?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 5,
          "explanation": "Az árfolyam-stabilitási kritérium szerint legalább 2 évig komoly feszültségek nélkül kell részt venni az ERM II-ben. Forrás: ECB (2025).",
          "options": [
            {"text": "1 év", "isCorrect": false, "order": 1},
            {"text": "2 év", "isCorrect": true, "order": 2},
            {"text": "3 év", "isCorrect": false, "order": 3},
            {"text": "5 év", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány százalékkal növelte az euró az euroövezeten belüli kereskedelmet?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 6,
          "explanation": "A konszenzusos becslések szerint az euró 5-10%-kal növelte az euroövezeten belüli kereskedelmet. Forrás: Baldwin & Melitz (2006), ECB Working Paper.",
          "options": [
            {"text": "2-3%", "isCorrect": false, "order": 1},
            {"text": "5-10%", "isCorrect": true, "order": 2},
            {"text": "15-20%", "isCorrect": false, "order": 3},
            {"text": "25-30%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az export és import a GDP hány százalékáról nőtt az euroövezetben 1999 és 2006 között?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 7,
          "explanation": "Az áruk exportja és importja az euroövezetben körülbelül a GDP 27%-áról 32%-ra nőtt 1999 és 2006 között. Forrás: Baldwin & Melitz (2006).",
          "options": [
            {"text": "20%-ról 25%-ra", "isCorrect": false, "order": 1},
            {"text": "27%-ról 32%-ra", "isCorrect": true, "order": 2},
            {"text": "35%-ról 42%-ra", "isCorrect": false, "order": 3},
            {"text": "40%-ról 50%-ra", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "A GDP hány százalékát teszi ki az árfolyam-ingadozások költsége, amit az euró megszüntet?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 8,
          "explanation": "Az euró megszünteti az árfolyam-ingadozások költségét, amelyet körülbelül a GDP 1%-ára becsülnek. Forrás: Baldwin & Melitz (2006), ECB.",
          "options": [
            {"text": "0,3%", "isCorrect": false, "order": 1},
            {"text": "0,7%", "isCorrect": false, "order": 2},
            {"text": "1,0%", "isCorrect": true, "order": 3},
            {"text": "2,5%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mennyi volt az átlagos infláció az euroövezetben 1999. január 1. óta?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 9,
          "explanation": "Az euró bevezetése óta az átlagos infláció az euroövezetben 2,09% volt, ami stabil árakat jelent. Forrás: European Central Bank (2025).",
          "options": [
            {"text": "1,5%", "isCorrect": false, "order": 1},
            {"text": "2,09%", "isCorrect": true, "order": 2},
            {"text": "3,2%", "isCorrect": false, "order": 3},
            {"text": "4,5%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány ember használja az eurót jelenleg?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 10,
          "explanation": "Az euró körülbelül 350 millió embert szolgál ki 20 országban (2025-től 21 ország Bulgáriával). Forrás: ECB (2025).",
          "options": [
            {"text": "250 millió", "isCorrect": false, "order": 1},
            {"text": "300 millió", "isCorrect": false, "order": 2},
            {"text": "350 millió", "isCorrect": true, "order": 3},
            {"text": "500 millió", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "A globális devizatartalékok hány százalékát teszik ki euróban tartott tartalékok?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 11,
          "explanation": "Körülbelül a globális devizatartalékok 20%-át tartják euróban, ami az eurót a második legfontosabb tartalékvalutává teszi. Forrás: ECB (2024).",
          "options": [
            {"text": "10%", "isCorrect": false, "order": 1},
            {"text": "15%", "isCorrect": false, "order": 2},
            {"text": "20%", "isCorrect": true, "order": 3},
            {"text": "30%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "A globális határokon átnyúló kifizetések hány százalékánál használják az eurót?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 12,
          "explanation": "Az eurót a globális határokon átnyúló kifizetések körülbelül 40%-ánál használják. Forrás: ECB (2025).",
          "options": [
            {"text": "20%", "isCorrect": false, "order": 1},
            {"text": "30%", "isCorrect": false, "order": 2},
            {"text": "40%", "isCorrect": true, "order": 3},
            {"text": "60%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU világszintű exportjának hány százalékánál használják az eurót?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 13,
          "explanation": "Az eurót az EU világszintű exportjának körülbelül felénél használják. Forrás: ECB (2025).",
          "options": [
            {"text": "30%", "isCorrect": false, "order": 1},
            {"text": "40%", "isCorrect": false, "order": 2},
            {"text": "50%", "isCorrect": true, "order": 3},
            {"text": "70%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az euroövezet lakosságának hány százaléka támogatja az eurót?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 14,
          "explanation": "A legutóbbi Eurobarométer szerint az euroövezet lakosságának körülbelül háromnegyede (75%) támogatja az eurót. Forrás: Eurobarometer, ECB.",
          "options": [
            {"text": "55%", "isCorrect": false, "order": 1},
            {"text": "65%", "isCorrect": false, "order": 2},
            {"text": "75%", "isCorrect": true, "order": 3},
            {"text": "85%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "A szimmetrikus sokkok az euroövezet országainak GDP mozgásának hány százalékát magyarázzák?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 15,
          "explanation": "A szimmetrikus sokkok körülbelül a GDP mozgás 60%-át magyarázzák az euroövezet országaiban (a globális pénzügyi válság alatt ez akár 80% is volt). Forrás: Kunovac et al. (2022), ECB Working Paper.",
          "options": [
            {"text": "30%", "isCorrect": false, "order": 1},
            {"text": "45%", "isCorrect": false, "order": 2},
            {"text": "60%", "isCorrect": true, "order": 3},
            {"text": "85%", "isCorrect": false, "order": 4}
          ]
        }
      ]
    },
    {
      "title": "EU Munkavállalás: Jogok és Lehetőségek",
      "description": "Dolgozz bárhol Európában! Ismerd meg az EU mobilitási lehetőségeit, jogaidat és az EURES hálózatot.",
      "category": "Foglalkoztatás",
      "difficulty": "MEDIUM",
      "timeLimit": 20,
      "maxAttempts": 2,
      "isPublic": true,
      "showResults": true,
      "status": "PUBLISHED",
      "questions": [
        {
          "question": "Hány munkaképes korú EU állampolgár él másik EU országban?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 1,
          "explanation": "2019-ben körülbelül 13 millió munkaképes korú (20-64 év) EU állampolgár élt másik EU országban, ami a munkaképes korú népesség 4,3%-a. Forrás: European Commission (2020), Intra-EU Labour Mobility.",
          "options": [
            {"text": "5 millió", "isCorrect": false, "order": 1},
            {"text": "9 millió", "isCorrect": false, "order": 2},
            {"text": "13 millió", "isCorrect": true, "order": 3},
            {"text": "20 millió", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU mobil munkavállalók közel fele melyik két országban él?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 2,
          "explanation": "Az EU munkaképes korú mobil állampolgárainak közel fele (46%) Németországban és az Egyesült Királyságban élt 2019-ben. Forrás: European Commission (2020).",
          "options": [
            {"text": "Franciaország és Spanyolország", "isCorrect": false, "order": 1},
            {"text": "Németország és UK", "isCorrect": true, "order": 2},
            {"text": "Olaszország és Hollandia", "isCorrect": false, "order": 3},
            {"text": "Belgium és Ausztria", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Melyik 5 ország állampolgárai teszik ki az EU mobil munkavállalók több mint 50%-át?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 3,
          "explanation": "Az EU mobil munkavállalók több mint 50%-a román, lengyel, olasz, portugál vagy bolgár állampolgár. Forrás: European Commission (2020).",
          "options": [
            {"text": "Német, francia, spanyol, görög, holland", "isCorrect": false, "order": 1},
            {"text": "Román, lengyel, olasz, portugál, bolgár", "isCorrect": true, "order": 2},
            {"text": "Cseh, szlovák, magyar, szlovén, horvát", "isCorrect": false, "order": 3},
            {"text": "Svéd, dán, finn, belga, osztrák", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mekkora a mobil EU munkavállalók foglalkoztatási rátája az állampolgárokéhoz képest?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 4,
          "explanation": "Az EU mobil munkavállalók magasabb foglalkoztatási rátával rendelkeznek (78%) az állampolgárokhoz képest (75%) 2019-ben. Forrás: European Commission (2020).",
          "options": [
            {"text": "78% vs 75%", "isCorrect": true, "order": 1},
            {"text": "70% vs 75%", "isCorrect": false, "order": 2},
            {"text": "65% vs 75%", "isCorrect": false, "order": 3},
            {"text": "75% vs 80%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány határokon átnyúló munkavállaló dolgozik az EU-ban és EFTA országokban?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 5,
          "explanation": "2019-ben körülbelül 1,89 millió határokon átnyúló munkavállaló dolgozott az EU és EFTA országokban. Forrás: European Commission (2020).",
          "options": [
            {"text": "500 ezer", "isCorrect": false, "order": 1},
            {"text": "1,2 millió", "isCorrect": false, "order": 2},
            {"text": "1,89 millió", "isCorrect": true, "order": 3},
            {"text": "3 millió", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Milyen elégedettségi rátát ér el az EURES hálózat az álláskeresők körében?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 6,
          "explanation": "Az EURES hálózat 70%-os elégedettségi rátát mutat az álláskeresők körében és 84%-ot a munkaadók körében. Forrás: Agence Europe (2021).",
          "options": [
            {"text": "50%", "isCorrect": false, "order": 1},
            {"text": "60%", "isCorrect": false, "order": 2},
            {"text": "70%", "isCorrect": true, "order": 3},
            {"text": "85%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány országra terjed ki az EURES hálózat működése?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 7,
          "explanation": "Az EURES hálózat 31 országban működik: mind a 27 EU tagállamban, plusz Izland, Liechtenstein, Norvégia és Svájc. Forrás: European Labour Authority (2024).",
          "options": [
            {"text": "27 ország", "isCorrect": false, "order": 1},
            {"text": "29 ország", "isCorrect": false, "order": 2},
            {"text": "31 ország", "isCorrect": true, "order": 3},
            {"text": "35 ország", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány álláslehetőséghez biztosít hozzáférést az EURES portál?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 8,
          "explanation": "Az EURES portál több mint 3 millió álláslehetőséghez biztosít hozzáférést Európa-szerte. Forrás: European Labour Authority (2024).",
          "options": [
            {"text": "1 millió", "isCorrect": false, "order": 1},
            {"text": "2 millió", "isCorrect": false, "order": 2},
            {"text": "3 millió", "isCorrect": true, "order": 3},
            {"text": "5 millió", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány szabályozott szakma létezik az EU-ban?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 9,
          "explanation": "Az EU-ban több mint 5 700 szabályozott szakma létezik, amelyek körülbelül 800 különböző kategóriába tartoznak. Forrás: European Parliament (2019), Labour mobility study.",
          "options": [
            {"text": "2 000", "isCorrect": false, "order": 1},
            {"text": "3 500", "isCorrect": false, "order": 2},
            {"text": "5 700", "isCorrect": true, "order": 3},
            {"text": "8 000", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU munkaerő hány százalékának kell előzetes engedélyt szereznie szakmája gyakorlásához?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 10,
          "explanation": "Legalább 50 millió embernek (az EU munkaerő 22%-a) szükséges előzetes engedély szakmája eléréséhez és gyakorlásához. Forrás: European Parliament (2019).",
          "options": [
            {"text": "10%", "isCorrect": false, "order": 1},
            {"text": "15%", "isCorrect": false, "order": 2},
            {"text": "22%", "isCorrect": true, "order": 3},
            {"text": "35%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mekkora a sikeres szakmai elismerések aránya az EU-ban 2011 óta?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 11,
          "explanation": "2011 óta körülbelül 85% vagy magasabb sikeres elismerési arány van az összes szabályozott szakmában. Forrás: European Parliament (2019).",
          "options": [
            {"text": "60%", "isCorrect": false, "order": 1},
            {"text": "70%", "isCorrect": false, "order": 2},
            {"text": "85%+", "isCorrect": true, "order": 3},
            {"text": "95%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "A magas képzettségű mobil munkavállalók hány százaléka dolgozik alacsonyabb képzettséget igénylő munkakörben?",
          "type": "MULTIPLE_CHOICE",
          "points": 10,
          "order": 12,
          "explanation": "A magas képzettségű mobil munkavállalók körülbelül 34%-a dolgozik képzettségénél alacsonyabb szintet igénylő munkakörben (túlképzettség). Forrás: European Commission (2023), Brain circulation study.",
          "options": [
            {"text": "15%", "isCorrect": false, "order": 1},
            {"text": "25%", "isCorrect": false, "order": 2},
            {"text": "34%", "isCorrect": true, "order": 3},
            {"text": "50%", "isCorrect": false, "order": 4}
          ]
        }
      ]
    },
    {
      "title": "Digitális Európa Kvíz",
      "description": "5G, mesterséges intelligencia, adatvédelem - az EU digitális jövője! Haladó kvíz a GDPR-ról, az AI Act-ről és a digitális single market-ről.",
      "category": "Technológia",
      "difficulty": "EXPERT",
      "timeLimit": 30,
      "maxAttempts": 2,
      "isPublic": true,
      "showResults": true,
      "status": "PUBLISHED",
      "questions": [
        {
          "question": "Hány kulcsfontosságú alapelvet határoz meg a GDPR 5. cikkelye?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 1,
          "explanation": "A GDPR 5. cikkelye 7 alapelvet határoz meg: jogszerűség/tisztesség/átláthatóság, célhoz kötöttség, adattakarékosság, pontosság, tárolás korlátozása, integritás/bizalmasság, elszámoltathatóság. Forrás: GDPR Regulation (EU) 2016/679.",
          "options": [
            {"text": "5 alapelv", "isCorrect": false, "order": 1},
            {"text": "6 alapelv", "isCorrect": false, "order": 2},
            {"text": "7 alapelv", "isCorrect": true, "order": 3},
            {"text": "9 alapelv", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mikor lépett teljes hatályba a GDPR?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 2,
          "explanation": "A GDPR (General Data Protection Regulation) 2018. május 25-én lépett teljes hatályba. Forrás: GDPR Regulation (EU) 2016/679.",
          "options": [
            {"text": "2016. május 25.", "isCorrect": false, "order": 1},
            {"text": "2017. május 25.", "isCorrect": false, "order": 2},
            {"text": "2018. május 25.", "isCorrect": true, "order": 3},
            {"text": "2019. május 25.", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mekkora lehet a maximális GDPR bírság a legsúlyosabb jogsértések esetén?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 3,
          "explanation": "A GDPR maximális bírságai 20 millió euró vagy az éves világpiaci forgalom 4%-a, amelyik magasabb. Forrás: GDPR Article 83.",
          "options": [
            {"text": "10 millió euró vagy 2%", "isCorrect": false, "order": 1},
            {"text": "15 millió euró vagy 3%", "isCorrect": false, "order": 2},
            {"text": "20 millió euró vagy 4%", "isCorrect": true, "order": 3},
            {"text": "50 millió euró vagy 10%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU AI Act (Regulation EU 2024/1689) mikor lépett hatályba?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 4,
          "explanation": "Az EU AI Act 2024. augusztus 1-jén lépett hatályba, teljes alkalmazás 2026. augusztus 2-tól várható. Forrás: Regulation (EU) 2024/1689.",
          "options": [
            {"text": "2023. augusztus 1.", "isCorrect": false, "order": 1},
            {"text": "2024. augusztus 1.", "isCorrect": true, "order": 2},
            {"text": "2025. január 1.", "isCorrect": false, "order": 3},
            {"text": "2026. augusztus 2.", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány kockázati szintre osztja az AI rendszereket az AI Act?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 5,
          "explanation": "Az AI Act 4 kockázati szintet határoz meg: elfogadhatatlan (betiltott), magas (szigorú kötelezettségek), korlátozott (átláthatósági kötelezettségek), minimális/nincs kockázat. Forrás: AI Act (2024).",
          "options": [
            {"text": "3 szint", "isCorrect": false, "order": 1},
            {"text": "4 szint", "isCorrect": true, "order": 2},
            {"text": "5 szint", "isCorrect": false, "order": 3},
            {"text": "6 szint", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mekkora az AI Act maximális pénzbüntetése?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 6,
          "explanation": "Az AI Act maximális pénzbüntetése 35 millió euró vagy a világpiaci forgalom 7%-a, amelyik magasabb. Forrás: Regulation (EU) 2024/1689.",
          "options": [
            {"text": "20 millió euró vagy 4%", "isCorrect": false, "order": 1},
            {"text": "25 millió euró vagy 5%", "isCorrect": false, "order": 2},
            {"text": "35 millió euró vagy 7%", "isCorrect": true, "order": 3},
            {"text": "50 millió euró vagy 10%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány betiltott AI gyakorlatot határoz meg az AI Act?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 7,
          "explanation": "Az AI Act 8 betiltott gyakorlatot határoz meg az elfogadhatatlan kockázatú kategóriában, beleértve a társadalmi pontozást. Forrás: AI Act (2024).",
          "options": [
            {"text": "5 gyakorlat", "isCorrect": false, "order": 1},
            {"text": "6 gyakorlat", "isCorrect": false, "order": 2},
            {"text": "8 gyakorlat", "isCorrect": true, "order": 3},
            {"text": "12 gyakorlat", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mikorra kell minden tagállamnak AI szabályozási homokozót létrehoznia?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 8,
          "explanation": "Minden tagállamnak legalább egy AI szabályozási homokozót (regulatory sandbox) kell létrehoznia 2026. augusztus 2-ig. Forrás: AI Act (2024).",
          "options": [
            {"text": "2024. augusztus 1.", "isCorrect": false, "order": 1},
            {"text": "2025. január 1.", "isCorrect": false, "order": 2},
            {"text": "2026. augusztus 2.", "isCorrect": true, "order": 3},
            {"text": "2027. január 1.", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mennyi éves gazdasági nyereséget generálhat a teljesen megvalósított Digitális Egységes Piac?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 9,
          "explanation": "A teljesen megvalósított Digitális Egységes Piac stratégia évi 176,6 milliárd eurót (2017-es EU GDP 1,2%-a) generálhat. Forrás: Marcus et al. (2019), Bruegel Institute.",
          "options": [
            {"text": "85 milliárd euró", "isCorrect": false, "order": 1},
            {"text": "120 milliárd euró", "isCorrect": false, "order": 2},
            {"text": "176,6 milliárd euró", "isCorrect": true, "order": 3},
            {"text": "250 milliárd euró", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az EU vállalkozások hány százaléka értékesít online belföldi piacon?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 10,
          "explanation": "Az EU vállalkozásoknak csak 20%-a értékesít online a belföldi piacon, és mindössze 9% ad el más EU országokba. Forrás: Marcus et al. (2019).",
          "options": [
            {"text": "10%", "isCorrect": false, "order": 1},
            {"text": "15%", "isCorrect": false, "order": 2},
            {"text": "20%", "isCorrect": true, "order": 3},
            {"text": "30%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mennyibe kerül az 5G teljes kiépítése az EU-ban 2025-ig?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 11,
          "explanation": "Az 5G teljes kiépítésének becsült költsége az EU-ban 281-391 milliárd euró 2025-ig, potenciálisan elérheti a 400 milliárd eurót. Forrás: European Court of Auditors (2022).",
          "options": [
            {"text": "150-200 milliárd euró", "isCorrect": false, "order": 1},
            {"text": "281-391 milliárd euró", "isCorrect": true, "order": 2},
            {"text": "500-600 milliárd euró", "isCorrect": false, "order": 3},
            {"text": "750 milliárd euró", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Az európai mobil kapcsolatok hány százaléka lesz 5G 2025-ben a GSMA becslése szerint?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 12,
          "explanation": "A GSMA szerint csak az európai mobil kapcsolatok 35%-a lesz 5G 2025-ben, szemben Észak-Amerika 51%-ával. Forrás: European Court of Auditors (2022).",
          "options": [
            {"text": "25%", "isCorrect": false, "order": 1},
            {"text": "35%", "isCorrect": true, "order": 2},
            {"text": "51%", "isCorrect": false, "order": 3},
            {"text": "65%", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mekkora az EU28 adatpiac közvetlen értéke 2017-ben, és mennyire nő 2025-re?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 13,
          "explanation": "Az EU28 adatpiac közvetlen értéke 50 milliárd euró volt 2017-ben, és várhatóan 110 milliárd euróra nő 2025-re. A szélesebb gazdasági hatás 787 milliárd euró lehet. Forrás: IDC Italia & Lisbon Council (2018).",
          "options": [
            {"text": "30 milliárd → 70 milliárd", "isCorrect": false, "order": 1},
            {"text": "50 milliárd → 110 milliárd", "isCorrect": true, "order": 2},
            {"text": "75 milliárd → 150 milliárd", "isCorrect": false, "order": 3},
            {"text": "100 milliárd → 200 milliárd", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Hány csatlakoztatott IoT eszköz lehet 2030-ra?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 14,
          "explanation": "A becslések szerint körülbelül 50 milliárd csatlakoztatott IoT eszköz lesz 2030-ra, 2018-as 22 milliárdról növekedve. Forrás: OECD (2024), Digital Economy Outlook.",
          "options": [
            {"text": "30 milliárd", "isCorrect": false, "order": 1},
            {"text": "40 milliárd", "isCorrect": false, "order": 2},
            {"text": "50 milliárd", "isCorrect": true, "order": 3},
            {"text": "75 milliárd", "isCorrect": false, "order": 4}
          ]
        },
        {
          "question": "Mennyi lehet az AI és gépi tanulás globális gazdasági hatása évente 2025-re?",
          "type": "MULTIPLE_CHOICE",
          "points": 15,
          "order": 15,
          "explanation": "A globális gazdasági hatás becslései az AI és gépi tanulás esetében évi 5,2-6,7 billió dollár 2025-re. Forrás: OECD (2024).",
          "options": [
            {"text": "2-3 billió dollár", "isCorrect": false, "order": 1},
            {"text": "5,2-6,7 billió dollár", "isCorrect": true, "order": 2},
            {"text": "10-12 billió dollár", "isCorrect": false, "order": 3},
            {"text": "15-20 billió dollár", "isCorrect": false, "order": 4}
          ]
        }
      ]
    }
  ]
};

async function main() {
  console.log('🚀 Starting final 4 EU quizzes import...\n');

  let imported = 0;
  let skipped = 0;

  for (const quiz of quizData.quizzes) {
    const { questions, ...quizInfo } = quiz as any;

    // Check if quiz already exists
    const existing = await prisma.quiz.findFirst({
      where: { title: quizInfo.title }
    });

    if (existing) {
      console.log(`⏭️  Skipping: ${quizInfo.title} (already exists)\n`);
      skipped++;
      continue;
    }

    console.log(`📝 Creating quiz: ${quizInfo.title}`);

    const createdQuiz = await prisma.quiz.create({
      data: {
        ...quizInfo,
        publishedAt: new Date(),
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            questionType: q.type,
            points: q.points,
            sortOrder: q.order,
            explanation: q.explanation,
            options: {
              create: q.options.map((opt: any) => ({
                optionText: opt.text,
                isCorrect: opt.isCorrect,
                sortOrder: opt.order
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    console.log(`✅ Created: ${createdQuiz.title} (${createdQuiz.questions.length} questions)\n`);
    imported++;
  }

  console.log(`\n🎉 Final import complete! Imported: ${imported}, Skipped: ${skipped}`);
  console.log(`\n📊 Total EU quizzes now: ${imported + skipped + 5} (should be 9)`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
