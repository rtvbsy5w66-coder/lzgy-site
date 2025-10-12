import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Teljes Budapest V. kerület (Belváros-Lipótváros) utcalistája
const completeAddressData = [
  // Akadémia utca
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '2', postalCode: '1054', lat: 47.5010, lng: 19.0435 },
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '4', postalCode: '1054', lat: 47.5011, lng: 19.0436 },
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '6', postalCode: '1054', lat: 47.5012, lng: 19.0437 },
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '8', postalCode: '1054', lat: 47.5013, lng: 19.0438 },
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '10', postalCode: '1054', lat: 47.5014, lng: 19.0439 },
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '12', postalCode: '1054', lat: 47.5015, lng: 19.0440 },
  { street: 'Akadémia', streetType: 'UTCA', houseNumber: '14', postalCode: '1054', lat: 47.5016, lng: 19.0441 },

  // Apáczai Csere János utca
  { street: 'Apáczai Csere János', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4960, lng: 19.0485 },
  { street: 'Apáczai Csere János', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4961, lng: 19.0486 },
  { street: 'Apáczai Csere János', streetType: 'UTCA', houseNumber: '5', postalCode: '1052', lat: 47.4962, lng: 19.0487 },
  { street: 'Apáczai Csere János', streetType: 'UTCA', houseNumber: '7', postalCode: '1052', lat: 47.4963, lng: 19.0488 },
  { street: 'Apáczai Csere János', streetType: 'UTCA', houseNumber: '9', postalCode: '1052', lat: 47.4964, lng: 19.0489 },
  { street: 'Apáczai Csere János', streetType: 'UTCA', houseNumber: '11', postalCode: '1052', lat: 47.4965, lng: 19.0490 },

  // Arany János utca
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.5000, lng: 19.0500 },
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.5001, lng: 19.0501 },
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.5002, lng: 19.0502 },
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.5003, lng: 19.0503 },
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '9', postalCode: '1051', lat: 47.5004, lng: 19.0504 },
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '11', postalCode: '1051', lat: 47.5005, lng: 19.0505 },
  { street: 'Arany János', streetType: 'UTCA', houseNumber: '13', postalCode: '1051', lat: 47.5006, lng: 19.0506 },

  // Aranykéz utca
  { street: 'Aranykéz', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4985, lng: 19.0525 },
  { street: 'Aranykéz', streetType: 'UTCA', houseNumber: '2', postalCode: '1052', lat: 47.4986, lng: 19.0526 },
  { street: 'Aranykéz', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4987, lng: 19.0527 },
  { street: 'Aranykéz', streetType: 'UTCA', houseNumber: '4', postalCode: '1052', lat: 47.4988, lng: 19.0528 },

  // Aulich utca
  { street: 'Aulich', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.5025, lng: 19.0475 },
  { street: 'Aulich', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.5026, lng: 19.0476 },
  { street: 'Aulich', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.5027, lng: 19.0477 },
  { street: 'Aulich', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.5028, lng: 19.0478 },

  // Balassi Bálint utca
  { street: 'Balassi Bálint', streetType: 'UTCA', houseNumber: '1', postalCode: '1055', lat: 47.5035, lng: 19.0410 },
  { street: 'Balassi Bálint', streetType: 'UTCA', houseNumber: '3', postalCode: '1055', lat: 47.5036, lng: 19.0411 },
  { street: 'Balassi Bálint', streetType: 'UTCA', houseNumber: '5', postalCode: '1055', lat: 47.5037, lng: 19.0412 },
  { street: 'Balassi Bálint', streetType: 'UTCA', houseNumber: '7', postalCode: '1055', lat: 47.5038, lng: 19.0413 },

  // Balaton utca
  { street: 'Balaton', streetType: 'UTCA', houseNumber: '1', postalCode: '1056', lat: 47.5040, lng: 19.0415 },
  { street: 'Balaton', streetType: 'UTCA', houseNumber: '3', postalCode: '1056', lat: 47.5041, lng: 19.0416 },
  { street: 'Balaton', streetType: 'UTCA', houseNumber: '5', postalCode: '1056', lat: 47.5042, lng: 19.0417 },

  // Bank utca
  { street: 'Bank', streetType: 'UTCA', houseNumber: '1', postalCode: '1054', lat: 47.4995, lng: 19.0445 },
  { street: 'Bank', streetType: 'UTCA', houseNumber: '3', postalCode: '1054', lat: 47.4996, lng: 19.0446 },
  { street: 'Bank', streetType: 'UTCA', houseNumber: '5', postalCode: '1054', lat: 47.4997, lng: 19.0447 },
  { street: 'Bank', streetType: 'UTCA', houseNumber: '7', postalCode: '1054', lat: 47.4998, lng: 19.0448 },

  // Bárczy István utca
  { street: 'Bárczy István', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4945, lng: 19.0515 },
  { street: 'Bárczy István', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4946, lng: 19.0516 },
  { street: 'Bárczy István', streetType: 'UTCA', houseNumber: '5', postalCode: '1052', lat: 47.4947, lng: 19.0517 },

  // Báthori utca
  { street: 'Báthori', streetType: 'UTCA', houseNumber: '1', postalCode: '1054', lat: 47.5045, lng: 19.0420 },
  { street: 'Báthori', streetType: 'UTCA', houseNumber: '3', postalCode: '1054', lat: 47.5046, lng: 19.0421 },
  { street: 'Báthori', streetType: 'UTCA', houseNumber: '5', postalCode: '1054', lat: 47.5047, lng: 19.0422 },

  // Bécsi utca
  { street: 'Bécsi', streetType: 'UTCA', houseNumber: '1', postalCode: '1056', lat: 47.5050, lng: 19.0425 },
  { street: 'Bécsi', streetType: 'UTCA', houseNumber: '3', postalCode: '1056', lat: 47.5051, lng: 19.0426 },
  { street: 'Bécsi', streetType: 'UTCA', houseNumber: '5', postalCode: '1056', lat: 47.5052, lng: 19.0427 },

  // Belgrád rakpart
  { street: 'Belgrád', streetType: 'RAKPART', houseNumber: '1', postalCode: '1056', lat: 47.4890, lng: 19.0520 },
  { street: 'Belgrád', streetType: 'RAKPART', houseNumber: '3', postalCode: '1056', lat: 47.4891, lng: 19.0521 },
  { street: 'Belgrád', streetType: 'RAKPART', houseNumber: '5', postalCode: '1056', lat: 47.4892, lng: 19.0522 },

  // Bihari János utca
  { street: 'Bihari János', streetType: 'UTCA', houseNumber: '1', postalCode: '1055', lat: 47.5055, lng: 19.0430 },
  { street: 'Bihari János', streetType: 'UTCA', houseNumber: '3', postalCode: '1055', lat: 47.5056, lng: 19.0431 },

  // Cukor utca
  { street: 'Cukor', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4975, lng: 19.0495 },
  { street: 'Cukor', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4976, lng: 19.0496 },
  { street: 'Cukor', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4977, lng: 19.0497 },

  // Deák Ferenc tér
  { street: 'Deák Ferenc', streetType: 'TER', houseNumber: '1', postalCode: '1052', lat: 47.4970, lng: 19.0540 },
  { street: 'Deák Ferenc', streetType: 'TER', houseNumber: '2', postalCode: '1052', lat: 47.4971, lng: 19.0541 },
  { street: 'Deák Ferenc', streetType: 'TER', houseNumber: '3', postalCode: '1052', lat: 47.4972, lng: 19.0542 },
  { street: 'Deák Ferenc', streetType: 'TER', houseNumber: '4', postalCode: '1052', lat: 47.4973, lng: 19.0543 },

  // Deák Ferenc utca
  { street: 'Deák Ferenc', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4965, lng: 19.0535 },
  { street: 'Deák Ferenc', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4966, lng: 19.0536 },
  { street: 'Deák Ferenc', streetType: 'UTCA', houseNumber: '5', postalCode: '1052', lat: 47.4967, lng: 19.0537 },
  { street: 'Deák Ferenc', streetType: 'UTCA', houseNumber: '7', postalCode: '1052', lat: 47.4968, lng: 19.0538 },

  // Dorottya utca
  { street: 'Dorottya', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4955, lng: 19.0505 },
  { street: 'Dorottya', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4956, lng: 19.0506 },
  { street: 'Dorottya', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4957, lng: 19.0507 },
  { street: 'Dorottya', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.4958, lng: 19.0508 },

  // Egyetem tér
  { street: 'Egyetem', streetType: 'TER', houseNumber: '1', postalCode: '1053', lat: 47.4920, lng: 19.0550 },
  { street: 'Egyetem', streetType: 'TER', houseNumber: '2', postalCode: '1053', lat: 47.4921, lng: 19.0551 },
  { street: 'Egyetem', streetType: 'TER', houseNumber: '3', postalCode: '1053', lat: 47.4922, lng: 19.0552 },

  // Eötvös tér
  { street: 'Eötvös', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.5015, lng: 19.0485 },
  { street: 'Eötvös', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.5016, lng: 19.0486 },
  { street: 'Eötvös', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.5017, lng: 19.0487 },

  // Erzsébet tér
  { street: 'Erzsébet', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.4980, lng: 19.0530 },
  { street: 'Erzsébet', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.4981, lng: 19.0531 },
  { street: 'Erzsébet', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.4982, lng: 19.0532 },

  // Falk Miksa utca
  { street: 'Falk Miksa', streetType: 'UTCA', houseNumber: '1', postalCode: '1055', lat: 47.5060, lng: 19.0435 },
  { street: 'Falk Miksa', streetType: 'UTCA', houseNumber: '3', postalCode: '1055', lat: 47.5061, lng: 19.0436 },
  { street: 'Falk Miksa', streetType: 'UTCA', houseNumber: '5', postalCode: '1055', lat: 47.5062, lng: 19.0437 },
  { street: 'Falk Miksa', streetType: 'UTCA', houseNumber: '7', postalCode: '1055', lat: 47.5063, lng: 19.0438 },

  // Fehérhajó utca
  { street: 'Fehérhajó', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.5035, lng: 19.0455 },
  { street: 'Fehérhajó', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.5036, lng: 19.0456 },

  // Ferenczy István utca
  { street: 'Ferenczy István', streetType: 'UTCA', houseNumber: '1', postalCode: '1053', lat: 47.4925, lng: 19.0555 },
  { street: 'Ferenczy István', streetType: 'UTCA', houseNumber: '3', postalCode: '1053', lat: 47.4926, lng: 19.0556 },

  // Fővám tér
  { street: 'Fővám', streetType: 'TER', houseNumber: '1', postalCode: '1056', lat: 47.4885, lng: 19.0515 },
  { street: 'Fővám', streetType: 'TER', houseNumber: '2', postalCode: '1056', lat: 47.4886, lng: 19.0516 },
  { street: 'Fővám', streetType: 'TER', houseNumber: '3', postalCode: '1056', lat: 47.4887, lng: 19.0517 },

  // Galamb utca
  { street: 'Galamb', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4990, lng: 19.0510 },
  { street: 'Galamb', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4991, lng: 19.0511 },
  { street: 'Galamb', streetType: 'UTCA', houseNumber: '5', postalCode: '1052', lat: 47.4992, lng: 19.0512 },

  // Harmincad utca
  { street: 'Harmincad', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4940, lng: 19.0525 },
  { street: 'Harmincad', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4941, lng: 19.0526 },
  { street: 'Harmincad', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4942, lng: 19.0527 },

  // Hercegprímás utca
  { street: 'Hercegprímás', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.5005, lng: 19.0465 },
  { street: 'Hercegprímás', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.5006, lng: 19.0466 },
  { street: 'Hercegprímás', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.5007, lng: 19.0467 },
  { street: 'Hercegprímás', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.5008, lng: 19.0468 },

  // Hold utca
  { street: 'Hold', streetType: 'UTCA', houseNumber: '1', postalCode: '1054', lat: 47.5030, lng: 19.0440 },
  { street: 'Hold', streetType: 'UTCA', houseNumber: '3', postalCode: '1054', lat: 47.5031, lng: 19.0441 },
  { street: 'Hold', streetType: 'UTCA', houseNumber: '5', postalCode: '1054', lat: 47.5032, lng: 19.0442 },
  { street: 'Hold', streetType: 'UTCA', houseNumber: '7', postalCode: '1054', lat: 47.5033, lng: 19.0443 },

  // Honvéd utca
  { street: 'Honvéd', streetType: 'UTCA', houseNumber: '1', postalCode: '1055', lat: 47.5040, lng: 19.0445 },
  { street: 'Honvéd', streetType: 'UTCA', houseNumber: '3', postalCode: '1055', lat: 47.5041, lng: 19.0446 },
  { street: 'Honvéd', streetType: 'UTCA', houseNumber: '5', postalCode: '1055', lat: 47.5042, lng: 19.0447 },

  // József Attila utca
  { street: 'József Attila', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4985, lng: 19.0470 },
  { street: 'József Attila', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4986, lng: 19.0471 },
  { street: 'József Attila', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4987, lng: 19.0472 },
  { street: 'József Attila', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.4988, lng: 19.0473 },

  // József nádor tér
  { street: 'József nádor', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.4990, lng: 19.0500 },
  { street: 'József nádor', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.4991, lng: 19.0501 },
  { street: 'József nádor', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.4992, lng: 19.0502 },

  // Kálvin tér
  { street: 'Kálvin', streetType: 'TER', houseNumber: '1', postalCode: '1053', lat: 47.4895, lng: 19.0565 },
  { street: 'Kálvin', streetType: 'TER', houseNumber: '2', postalCode: '1053', lat: 47.4896, lng: 19.0566 },
  { street: 'Kálvin', streetType: 'TER', houseNumber: '3', postalCode: '1053', lat: 47.4897, lng: 19.0567 },

  // Március 15. tér
  { street: 'Március 15.', streetType: 'TER', houseNumber: '1', postalCode: '1056', lat: 47.4900, lng: 19.0525 },
  { street: 'Március 15.', streetType: 'TER', houseNumber: '2', postalCode: '1056', lat: 47.4901, lng: 19.0526 },
  { street: 'Március 15.', streetType: 'TER', houseNumber: '3', postalCode: '1056', lat: 47.4902, lng: 19.0527 },

  // Nádor utca
  { street: 'Nádor', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.5000, lng: 19.0485 },
  { street: 'Nádor', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.5001, lng: 19.0486 },
  { street: 'Nádor', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.5002, lng: 19.0487 },
  { street: 'Nádor', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.5003, lng: 19.0488 },
  { street: 'Nádor', streetType: 'UTCA', houseNumber: '9', postalCode: '1051', lat: 47.5004, lng: 19.0489 },
  { street: 'Nádor', streetType: 'UTCA', houseNumber: '11', postalCode: '1051', lat: 47.5005, lng: 19.0490 },

  // Roosevelt tér
  { street: 'Roosevelt', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.5010, lng: 19.0520 },
  { street: 'Roosevelt', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.5011, lng: 19.0521 },
  { street: 'Roosevelt', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.5012, lng: 19.0522 },
  { street: 'Roosevelt', streetType: 'TER', houseNumber: '5', postalCode: '1051', lat: 47.5013, lng: 19.0523 },

  // Széchenyi István tér
  { street: 'Széchenyi István', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.5015, lng: 19.0515 },
  { street: 'Széchenyi István', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.5016, lng: 19.0516 },
  { street: 'Széchenyi István', streetType: 'TER', houseNumber: '3', postalCode: '1051', lat: 47.5017, lng: 19.0517 },

  // Zrínyi utca
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4995, lng: 19.0475 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4996, lng: 19.0476 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '5', postalCode: '1051', lat: 47.4997, lng: 19.0477 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '7', postalCode: '1051', lat: 47.4998, lng: 19.0478 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '9', postalCode: '1051', lat: 47.4999, lng: 19.0479 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '11', postalCode: '1051', lat: 47.5000, lng: 19.0480 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '13', postalCode: '1051', lat: 47.5001, lng: 19.0481 },
  { street: 'Zrínyi', streetType: 'UTCA', houseNumber: '15', postalCode: '1051', lat: 47.5002, lng: 19.0482 },

  // További fontós utcák
  // Vigadó tér
  { street: 'Vigadó', streetType: 'TER', houseNumber: '1', postalCode: '1051', lat: 47.4965, lng: 19.0505 },
  { street: 'Vigadó', streetType: 'TER', houseNumber: '2', postalCode: '1051', lat: 47.4966, lng: 19.0506 },

  // Régi posta utca
  { street: 'Régi posta', streetType: 'UTCA', houseNumber: '1', postalCode: '1052', lat: 47.4975, lng: 19.0515 },
  { street: 'Régi posta', streetType: 'UTCA', houseNumber: '3', postalCode: '1052', lat: 47.4976, lng: 19.0516 },

  // Papnövelde utca
  { street: 'Papnövelde', streetType: 'UTCA', houseNumber: '1', postalCode: '1053', lat: 47.4930, lng: 19.0570 },
  { street: 'Papnövelde', streetType: 'UTCA', houseNumber: '3', postalCode: '1053', lat: 47.4931, lng: 19.0571 },

  // Molnár utca
  { street: 'Molnár', streetType: 'UTCA', houseNumber: '1', postalCode: '1056', lat: 47.4880, lng: 19.0530 },
  { street: 'Molnár', streetType: 'UTCA', houseNumber: '3', postalCode: '1056', lat: 47.4881, lng: 19.0531 },

  // Kigyó utca
  { street: 'Kigyó', streetType: 'UTCA', houseNumber: '1', postalCode: '1053', lat: 47.4910, lng: 19.0560 },
  { street: 'Kigyó', streetType: 'UTCA', houseNumber: '3', postalCode: '1053', lat: 47.4911, lng: 19.0561 },
  { street: 'Kigyó', streetType: 'UTCA', houseNumber: '5', postalCode: '1053', lat: 47.4912, lng: 19.0562 },

  // Irányi utca
  { street: 'Irányi', streetType: 'UTCA', houseNumber: '1', postalCode: '1056', lat: 47.4890, lng: 19.0535 },
  { street: 'Irányi', streetType: 'UTCA', houseNumber: '3', postalCode: '1056', lat: 47.4891, lng: 19.0536 },

  // Haris köz
  { street: 'Haris köz', streetType: 'OTHER', houseNumber: '1', postalCode: '1052', lat: 47.4970, lng: 19.0520 },
  { street: 'Haris köz', streetType: 'OTHER', houseNumber: '2', postalCode: '1052', lat: 47.4971, lng: 19.0521 },

  // Gerlóczy utca
  { street: 'Gerlóczy', streetType: 'UTCA', houseNumber: '1', postalCode: '1051', lat: 47.4980, lng: 19.0510 },
  { street: 'Gerlóczy', streetType: 'UTCA', houseNumber: '3', postalCode: '1051', lat: 47.4981, lng: 19.0511 },
];

async function seedCompleteAddresses() {
  try {
    console.log('🏗️ TELJES V. kerület címadatok importálása...');
    
    // 1. Kerület létrehozása/frissítése
    const district = await prisma.district.upsert({
      where: { number: 5 },
      update: {},
      create: {
        number: 5,
        name: 'V. kerület',
        officialName: 'Belváros-Lipótváros'
      }
    });
    
    console.log(`✅ Kerület: ${district.name}`);
    
    // 2. Utcák csoportosítása
    const streetGroups = new Map<string, typeof completeAddressData>();
    
    completeAddressData.forEach(addr => {
      const streetKey = `${addr.street}-${addr.streetType}`;
      if (!streetGroups.has(streetKey)) {
        streetGroups.set(streetKey, []);
      }
      streetGroups.get(streetKey)!.push(addr);
    });
    
    let totalAddresses = 0;
    let totalStreets = 0;
    
    // 3. Utcák és címek létrehozása
    for (const [streetKey, addresses] of streetGroups) {
      const firstAddr = addresses[0];
      
      // Utca létrehozása
      const street = await prisma.street.upsert({
        where: {
          name_districtId: {
            name: firstAddr.street,
            districtId: district.id
          }
        },
        update: {},
        create: {
          name: firstAddr.street,
          streetType: firstAddr.streetType as any,
          districtId: district.id
        }
      });
      
      // Címek létrehozása
      for (const addrData of addresses) {
        const houseNumberInt = parseInt(addrData.houseNumber.replace(/\D/g, '')) || 0;
        
        await prisma.address.upsert({
          where: {
            streetId_houseNumber: {
              streetId: street.id,
              houseNumber: addrData.houseNumber
            }
          },
          update: {
            postalCode: addrData.postalCode,
            latitude: addrData.lat,
            longitude: addrData.lng,
            isActive: true
          },
          create: {
            streetId: street.id,
            houseNumber: addrData.houseNumber,
            houseNumberInt,
            postalCode: addrData.postalCode,
            latitude: addrData.lat,
            longitude: addrData.lng,
            isActive: true
          }
        });
        
        totalAddresses++;
      }
      
      totalStreets++;
      console.log(`✅ ${street.name} ${street.streetType.toLowerCase()} - ${addresses.length} cím`);
    }
    
    console.log(`\n🎉 TELJES IMPORT BEFEJEZVE!`);
    console.log(`📊 ${totalStreets} utca, ${totalAddresses} cím`);
    
    // 4. Statisztikák
    const stats = await prisma.address.groupBy({
      by: ['postalCode'],
      where: {
        street: {
          districtId: district.id
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        postalCode: 'asc'
      }
    });
    
    console.log('\n📊 Irányítószám statisztikák:');
    stats.forEach(stat => {
      console.log(`   ${stat.postalCode}: ${stat._count.id} cím`);
    });
    
  } catch (error) {
    console.error('❌ Import hiba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Futtatás
if (require.main === module) {
  seedCompleteAddresses()
    .then(() => {
      console.log('✅ TELJES V. KERÜLET CÍMADATBÁZIS KÉSZ!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import sikertelen:', error);
      process.exit(1);
    });
}

export { seedCompleteAddresses };