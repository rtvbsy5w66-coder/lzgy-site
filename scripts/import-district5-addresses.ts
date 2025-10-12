import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// V. kerületi címek adatai - CSV formátumból átalakítva
const addressesData = `
Bajcsy-Zsilinszky út	36-38	1054
Balassi Bálint utca	15-17	1055
Bajcsy-Zsilinszky út	16	1365
Szalay utca	10-14	1363
Akadémia utca	8	1054
Falk Miksa utca	16	1055
Hold utca	21	1054
Arany János utca	9	1051
Arany János utca	13	1051
Arany János utca	20	1051
Kossuth Lajos tér	18	1055
Szent István körút	15	1055
Szent István tér	9-11	1051
Szabadság tér	5-6	1054
Nyugati tér	9	1055
Szabadság tér	7-8	1054
Szent István körút	1	1055
Arany János utca	17	1051
Hercegprímás utca	15	1051
Arany János utca	27-29	1051
Hercegprímás utca	18	1051
Arany János utca	34	1051
Bajcsy-Zsilinszky út	42-46	1054
Bajcsy-Zsilinszky út	72	1055
Bajcsy-Zsilinszky út	74	1055
Nyugati tér	9	1055
Nyugati tér	7	1055
Szent István körút	17	1055
Szent István körút	13	1055
Szent István körút	7	1055
Falk Miksa utca	32	1055
Falk Miksa utca	17	1055
Szalay utca	3	1055
Szemere utca	3	1054
Széchenyi István tér	5-6	1051
Kálmán Imre utca	19	1054
Vadász utca	42	1054
Kossuth Lajos tér	1-3	1055
Nagy Ignác utca	16	1055
Alkotmány utca	9-11	1054
Honvéd utca	5	1054
Honvéd utca	3	1054
Kálmán Imre utca	15	1054
Vécsey utca	5	1054
Nagysándor József utca	1	1054
Hold utca	11	1054
Bank utca	5	1054
Széchenyi utca	14	1054
Garibaldi utca	7	1054
Kossuth Lajos tér	10	1055
Zoltán utca	16	1054
Nádor utca	19	1051
Vigyázó Ferenc utca	6	1051
Vigyázó Ferenc utca	4	1051
Széchenyi István tér	7-8	1051
Nádor utca	5	1051
Szervita tér	3	1052
József Attila utca	16	1051
Sas utca	2	1051
Október 6. utca	3	1051
Október 6. utca	5	1051
Október 6. utca	4	1051
Október 6. utca	6	1051
Október 6. utca	8	1051
Sas utca	6	1051
Sas utca	4	1051
Hercegprímás utca	4	1051
Hercegprímás utca	7	1051
Bajcsy-Zsilinszky út	24	1051
Szent István tér	11	1051
Markó utca	22	1055
Régi posta utca	10	1052
Váci utca	7	1052
Vámház körút	2	1053
Múzeum körút	1/b	1053
Nagy Ignác utca	2-4	1055
Gerlóczy utca	6	1052
Dorottya utca	9	1351
Múzeum körút	31-33	1353
Fővám tér	5	1056
Pilvax köz	1-3	1052
Semmelweis utca	14	1052
Váci utca	40	1056
Váci utca	9	1052
Kossuth Lajos utca	18	1053
Ferenciek tere	2	1053
Fehér Hajó utca	5	1052
Kálvin tér	2	1053
Veres Pálné utca	2	1053
Váci utca	38	1056
Kálvin tér	4	1053
Kecskeméti utca	14	1053
Kígyó utca	4-6	1052
Kossuth Lajos utca	2/a	1053
Bajcsy-Zsilinszky út	40	1054
Bihari János utca	18	1055
Bihari János utca	17	1055
Alkotmány utca	31	1054
Podmaniczky Frigyes tér	4	1054
Szent István tér	3	1051
Sas utca	9	1051
Szabadság tér	7	1054
Hold utca	15	1054
Mérleg utca	10	1051
Honvéd utca	17	1055
Október 6. utca	15	1051
Október 6. utca	17	1051
Október 6. utca	19	1051
Szemere utca	19	1054
Szemere utca	23	1054
Falk Miksa utca	14	1055
Balassi Bálint utca	2	1055
Balassi Bálint utca	27	1055
Nádor utca	29	1051
Báthory utca	7	1054
Nádor utca	34	1051
Sas utca	17	1051
Vigadó tér	2-es ponton	1052
Erzsébet tér	1	1051
Erzsébet tér	3	1051
Erzsébet tér	9-10	1051
Deák Ferenc utca	12-14	1052
Harmincad utca	4	1051
Vörösmarty tér	7-8	1051
Deák Ferenc utca	10	1052
Vigadó tér	4-6	1051
Dorottya utca	2-4	1051
Széchenyi István tér	2	1051
Vigadó tér	3	1051
Apáczai Csere János utca	12-14	1051
Veres Pálné utca	4-6	1053
Aranykéz utca	2	1052
Károly körút	24	1052
Gerlóczy utca	1	1052
Apáczai Csere János utca	1	1051
Királyi Pál utca	8	1053
Váci utca	3	1052
Vörösmarty tér	1	1051
Ferenciek tere	5	1053
Ferenczy István utca	5	1053
Városház utca	14	1052
Március 15. tér	7	1056
Királyi Pál utca	18	1053
Egyetem tér	5	1053
Kecskeméti utca	6	1053
Régi posta utca	19	1052
Kristóf tér	6	1052
Petőfi Sándor utca	7	1052
Petőfi Sándor utca	6	1052
Vörösmarty tér	2	1051
Petőfi Sándor utca	8	1052
Deák Ferenc utca	21	1052
Kristóf tér	8	1052
Kristóf tér	9	1052
Kristóf tér	7	1052
Kristóf tér	1	1052
Kristóf tér	4	1052
Kristóf tér	5	1052
Kristóf tér	2	1052
Váci utca	86	1056
Fővám tér	6	1056
Só utca	4	1056
Sas utca	11	1051
Deák Ferenc tér	3	1052
Kecskeméti utca	4	1053
József nádor tér	4	1051
József Attila utca	3	1051
Vörösmarty tér	3	1051
József Attila utca	2	1051
József Attila utca	4	1051
József nádor tér	2	1051
Vörösmarty tér	8	1051
József nádor tér	3	1051
Vörösmarty tér	7	1051
Vörösmarty tér	6	1051
József Attila utca	1	1051
Harmincad utca	2	1051
Harmincad utca	6	1051
Harmincad utca	3	1051
József nádor tér	1	1051
József Attila utca	6	1051
Harmincad utca	1	1051
Irányi utca	19-23	1056
Vámház körút	4	1053
Nádor utca	20	1051
Bajcsy-Zsilinszky út	20	1051
Nádor utca	18	1051
Bajcsy-Zsilinszky út	18	1051
Kecskeméti utca	1	1053
Károlyi utca	9	1053
Szemere utca	16-18	1054
Váci utca	1	1052
Ferenciek tere	10	1053
Ferenciek tere	11	1053
Váci utca	11/b	1052
Váci utca	13	1052
Váci utca	14	1052
Régi posta utca	15	1052
Kígyó utca	2	1052
Váci utca	2	1052
Váci utca	25	1052
Váci utca	26	1052
Váci utca	28	1052
Váci utca	30	1052
Váci utca	32	1052
Váci utca	4	1052
Váci utca	6	1052
Váci utca	11/a	1052
Kálvin tér	3	1053
Október 6. utca	26	1051
Aulich utca	7	1054
Aulich utca	8	1054
Hold utca	3-5	1054
Honvéd utca	18	1055
Vámház körút	14	1053
Sas utca	3	1051
Sas utca	1	1051
Vértanúk tere	1	1054
Piarista köz	1	1052
Egyetem tér	4	1053
Deák Ferenc utca	3-5	1052
Szent István körút	11	1055
Arany János utca	30	1051
Múzeum körút	39	1053
Vámház körút	16	1053
Károly körút	26	1052
Károly körút	16	1052
Balassi Bálint utca	7	1055
Arany János utca	32	1051
Károly körút	22-24	1052
Károlyi utca	16	1053
Múzeum körút	13	1053
Piarista utca	1	1052
József nádor tér	9	1051
Semmelweis utca	19	1052
Múzeum körút	5	1053
Magyar utca	23	1053
Arany János utca	15	1051
Arany János utca	14	1051
Október 6. utca	24	1051
Károlyi utca	11	1053
Kecskeméti utca	5	1053
Arany János utca	26-28	1051
Alkotmány utca	20	1054
Királyi Pál utca	13/a	1053
Belgrád rakpart	16	1056
Hold utca	13	1054
Váci utca	60	1056
Váci utca	49	1056
Belgrád rakpart	3-4	1056
Só utca	3	1056
Váci utca	15	1052
Belgrád rakpart	13-15	1056
Királyi Pál utca	14	1053
Váci utca	20	1052
Deák Ferenc utca	15	1052
Sütő utca	2	1052
Erzsébet tér	7-8	1051
Belgrád rakpart	18	1056
Vigyázó Ferenc utca	7	1051
Vámház körút	6	1053
Váci utca	65	1056
Váci utca	5	1052
Vécsey utca	3	1054
Váci utca	34	1052
Fővám tér	2-3	1056
Veres Pálné utca	10	1053
Veres Pálné utca	7	1053
Nyáry Pál utca	11	1056
Magyar utca	52	1053
Váci utca	67	1056
Reáltanoda utca	16	1053
Dorottya utca	1	1051
Múzeum körút	41	1053
Apáczai Csere János utca	17	1051
Kecskeméti utca	15	1053
Kossuth Lajos utca	19-21	1053
Váci utca	41/a	1056
Aranykéz utca	2	1052
Piarista utca	6	1052
Sörház utca	4	1056
Szent István körút	17	1055
Sas utca	18	1051
Váci utca	27	1052
Kossuth Lajos utca	14-16	1053
Kossuth Lajos utca	1	1053
Kossuth Lajos utca	5	1053
Károly körút	4	1052
Haris köz	2/a	1052
Városház utca	10	1052
Semmelweis utca	3	1052
Királyi Pál utca	9	1053
Petőfi tér	2	1052
Petőfi tér	3-5	1052
Váci utca	71	1056
Váci utca	48	1056
Hercegprímás utca	2	1051
Károly körút	10	1052
Kecskeméti utca	2	1053
Apáczai Csere János utca	7	1051
Ferenciek tere	7-8	1053
Vörösmarty tér	9	1051
Zrínyi utca	12	1051
Zrínyi utca	4	1051
Markó utca	27	1055
Október 6. utca	22	1051
Nádor utca	17	1051
Falk Miksa utca	1	1055
Balassi Bálint utca	13	1055
Falk Miksa utca	2	1055
Báthory utca	19	1054
Belgrád rakpart	26	1056
Szabadság tér	14	1054
Papnövelde utca	1	1053
Képíró utca	10	1053
Kecskeméti utca	10-12	1053
Veres Pálné utca	17	1053
Veres Pálné utca	19	1053
Veres Pálné utca	36	1053
Veres Pálné utca	44	1053
Szarka utca	5	1056
Királyi Pál utca	5	1053
Királyi Pál utca	6	1053
Királyi Pál utca	7	1053
Gerlóczy utca	7	1052
Városház utca	16	1052
Szent István tér	4-5	1051
Október 6. utca	21	1051
Múzeum körút	11	1053
Királyi Pál utca	20	1053
Báthory utca	8	1054
Fővám tér	4	1056
Molnár utca	36-40	1056
Molnár utca	37-43	1056
Havas utca	6	1056
Váci utca	62-64	1056
Falk Miksa utca	28	1055
Fejér György utca	1	1053
Kossuth Lajos tér	11	1055
Váci utca	81	1056
Múzeum körút	23-25	1053
Múzeum körút	35	1053
Múzeum körút	29	1053
Múzeum körút	27	1053
Múzeum körút	21	1053
Múzeum körút	7	1053
Múzeum körút	9	1053
Múzeum körút	13-15	1053
Múzeum körút	17	1053
Múzeum körút	15	1053
Bástya utca	12	1056
Szervita tér	5	1052
Petőfi Sándor utca	18	1052
Bécsi utca	3	1052
Bárczy István utca	1-3	1052
Szervita tér	4	1052
Bárczy István utca	10	1052
Zrínyi utca	16	1051
Kossuth Lajos utca	2/b	1053
Steindl Imre utca	13	1054
Papnövelde utca	10	1053
Károlyi utca	19	1053
Károlyi utca	17	1053
Henszlmann Imre utca	9	1053
Múzeum körút	3	1053
Apáczai Csere János utca	4	1051
Múzeum körút	37	1053
Múzeum körút	19	1053
Magyar utca	8-10	1053
Kecskeméti utca	13	1053
Kecskeméti utca	9	1053
Képíró utca	11	1053
Kecskeméti utca	11	1053
Március 15. tér	4	1056
Ferenciek tere	4	1053
Ferenciek tere	9	1053
Ferenciek tere	3	1053
Kossuth Lajos utca	13	1053
Kossuth Lajos utca	17	1053
Kossuth Lajos utca	3	1053
Magyar utca	1	1053
Magyar utca	12-14	1053
Magyar utca	5	1053
Henszlmann Imre utca	1	1053
Ferenczy István utca	24	1053
Károlyi utca	14/a	1053
Károlyi utca	14/b	1053
Károlyi utca	14/c	1053
Szép utca	1	1053
Reáltanoda utca	10	1053
Kossuth Lajos utca	15	1053
Magyar utca	42	1053
Magyar utca	22	1053
Magyar utca	18	1053
Magyar utca	44	1053
Magyar utca	21	1053
Magyar utca	40	1053
Ferenczy István utca	28	1053
Szent István körút	9	1055
Papnövelde utca	3	1053
Papnövelde utca	8	1053
Papnövelde utca	4-6	1053
Cukor utca	6	1056
Irányi utca	27	1056
Cukor utca	5	1056
Irányi utca	20	1056
Cukor utca	3	1056
Irányi utca	25	1056
Cukor utca	1	1056
Podmaniczky Frigyes tér	2	1054
Veres Pálné utca	5	1053
Veres Pálné utca	3	1053
Veres Pálné utca	16	1053
Veres Pálné utca	22	1053
Veres Pálné utca	15	1053
Kálvin tér	1	1053
Kossuth Lajos utca	4	1053
Kálvin tér	6	1053
Kálvin tér	5	1053
Vámház körút	12	1053
Vámház körút	10	1053
Vámház körút	8	1053
Fejér György utca	3	1053
Királyi Pál utca	13/b	1053
Bástya utca	14	1056
Királyi Pál utca	11	1053
Királyi Pál utca	16	1053
Képíró utca	5	1053
Képíró utca	3	1053
Képíró utca	8	1053
Képíró utca	9	1053
Királyi Pál utca	10	1053
Szerb utca	21-23	1056
Szerb utca	17-19	1056
Szerb utca	15	1056
Szerb utca	8	1056
Veres Pálné utca	40	1053
Só utca	8	1056
Só utca	5	1056
Váci utca	84	1056
Váci utca	82	1056
Váci utca	79	1056
Váci utca	83	1056
Váci utca	74	1056
Váci utca	75	1056
Váci utca	77	1056
Váci utca	78-80	1056
Váci utca	72	1056
Váci utca	73	1056
Szent István körút	23	1055
Váci utca	66	1056
Váci utca	70	1056
Váci utca	69	1056
Váci utca	68	1056
Váci utca	61	1056
Váci utca	63	1056
Váci utca	51	1056
Váci utca	57	1056
Váci utca	56-58	1056
Váci utca	52	1056
Váci utca	53	1056
Váci utca	59	1056
Szent István körút	1	1055
Kálmán Imre utca	23	1054
Váci utca	44	1056
Váci utca	42	1056
Váci utca	45	1056
Váci utca	46	1056
Váci utca	50	1056
Erzsébet tér	9-10	1051
Szarka utca	1	1056
Szarka utca	3	1056
Szarka utca	6	1056
Veres Pálné utca	33	1053
Szabadság tér	7	1054
Kálmán Imre utca	22	1054
Nyáry Pál utca	7	1056
Nyáry Pál utca	8	1056
Nyáry Pál utca	6	1056
Irányi utca	15	1056
Veres Pálné utca	8	1053
Curia utca	5	1053
Curia utca	4	1053
Curia utca	3	1053
Szabad sajtó út	5	1056
Március 15. tér	7-8	1056
Duna utca	1	1056
Nádor utca	28	1051
Akadémia utca	9	1054
Haris köz	1	1052
Károly körút	22	1052
Haris köz	4	1052
Petőfi Sándor utca	5	1052
Alkotmány utca	8	1054
Akadémia utca	16	1054
Markó utca	1/b	1055
Havas utca	5	1056
Havas utca	7	1056
Havas utca	2	1056
Molnár utca	33	1056
Molnár utca	26	1056
Molnár utca	20	1056
Molnár utca	27	1056
Sörház utca	1	1056
Sörház utca	5	1056
Molnár utca	22-24	1056
Molnár utca	14	1056
Molnár utca	17	1056
Molnár utca	23	1056
Molnár utca	12	1056
Molnár utca	3	1056
Molnár utca	5	1056
Molnár utca	4	1056
Hercegprímás utca	19	1051
Irányi utca	12	1056
Irányi utca	5	1056
Irányi utca	10	1056
Irányi utca	8	1056
Irányi utca	7	1056
Belgrád rakpart	27	1056
Váci utca	39	1056
Váci utca	41/b	1056
Irányi utca	1	1056
Molnár utca	1	1056
Belgrád rakpart	25	1056
Belgrád rakpart	23	1056
Belgrád rakpart	17	1056
Belgrád rakpart	19	1056
Belgrád rakpart	22	1056
Belgrád rakpart	11	1056
Belgrád rakpart	6-8	1056
Erzsébet tér	11-13	1051
Balassi Bálint utca	21-23	1055
Bajcsy-Zsilinszky út	60	1054
Deák Ferenc utca	23	1052
Szent István körút	29	1055
Bihari János utca	13	1055
Erzsébet tér	12	1051
Széchenyi István tér	7-8	1051
Aranykéz utca	5	1052
Hercegprímás utca	12	1051
Bajcsy-Zsilinszky út	36-38	1054
Kossuth Lajos tér	1-3	1055
Nagysándor József utca	3	1054
Hercegprímás utca	9	1051
Szent István körút	3	1055
Váci utca	22	1052
Vigyázó Ferenc utca	5	1051
Bajcsy-Zsilinszky út	66	1054
Kossuth Lajos tér	10	1055
Falk Miksa utca	5	1055
Bajcsy-Zsilinszky út	78	1055
Szent István körút	19	1055
Szemere utca	22	1054
Szent István körút	5	1055
Hold utca	9	1054
Bajcsy-Zsilinszky út	12	1051
Károly körút	6	1052
Duna utca	6	1056
Károly körút	12	1052
Sas utca	8	1051
Régi posta utca	5	1052
Falk Miksa utca	12	1055
Bécsi utca	1	1052
Bank utca	4	1054
Hercegprímás utca	17	1051
Sas utca	9	1051
Bank utca	3	1054
Ferenciek tere	3	1053
Bécsi utca	5	1052
Vörösmarty tér	1	1051
Váci utca	10	1052
Kristóf tér	7-8	1052
Váci utca	31	1052
Váci utca	33	1052
Piarista köz	1	1052
Hold utca	27	1054
Petőfi Sándor utca	11	1052
Nádor utca	36	1051
Garibaldi utca	4	1054
Kristóf tér	3	1052
Sas utca	7	1051
Falk Miksa utca	21	1055
Kossuth Lajos utca	17	1053
Deák Ferenc utca	17	1052
Nádor utca	24	1051
Szent István körút	25	1055
Városház utca	1	1052
Városház utca	3	1052
Városház utca	5	1052
Piarista utca	2	1052
Hercegprímás utca	5	1051
Garibaldi utca	5	1054
Báthory utca	1	1054
Piarista utca	4	1052
Váci utca	19-21	1052
Károlyi utca	11-15	1053
Vigadó tér	2	1051
Arany János utca	19	1051
Szent István tér	1	1051
Október 6. utca	16-18	1051
Magyar utca	26	1053
Aulich utca	4-6	1054
Galamb utca	6	1052
Kálmán Imre utca	16	1054
Jane Haining rakpart	7	1052
Falk Miksa utca	30	1055
Henszlmann Imre utca	3	1053
Képíró utca	6	1053
Vadász utca	29	1054
Szép utca	1/b	1053
Régi posta utca	4	1052
Piarista köz	2	1052
Bajcsy-Zsilinszky út	47	1065
Alkotmány utca	19	1054
Jászai Mari tér	2	1055
József Attila utca	20	1051
Kossuth Lajos utca	20	1053
Szent István körút	21	1055
Pilvax köz	1-3	1052
Deák Ferenc utca	19	1052
Honvéd utca	38	1055
Balassi Bálint utca	25	1055
Párizsi utca	3	1052
Károly körút	14	1052
Károly körút	18	1052
Váci utca	24	1052
Kossuth Lajos utca	12	1053
Párizsi utca	4	1052
Régi posta utca	11	1052
Vigadó utca	7	1051
Petőfi Sándor utca	16	1052
Dorottya utca	6	1051
Régi posta utca	17-19	1052
Petőfi Sándor utca	14	1052
Petőfi Sándor utca	13-15	1052
Városház utca	18	1052
Párizsi utca	8	1052
Fehér Hajó utca	2-6	1052
Párizsi utca	5	1052
Petőfi Sándor utca	9	1052
Petőfi Sándor utca	1	1052
Semmelweis utca	2	1052
Zrínyi utca	3	1051
Zrínyi utca	5	1051
Petőfi Sándor utca	12	1052
Petőfi Sándor utca	17-19	1052
Nádor utca	14	1051
Nádor utca	23	1051
Bank utca	6	1054
Dorottya utca	13	1051
Szent István körút	3	1055
Arany János utca	27	1051
Podmaniczky Frigyes tér	1	1054
Szent István tér	12	1051
Szent István tér	16	1051
Zoltán utca	3	1054
Nádor utca	8	1051
Párizsi utca	6b	1052
Alkotmány utca	4	1054
József nádor tér	8	1051
Haris köz	2	1052
Arany János utca	16	1051
Régi posta utca	1-3	1052
Régi posta utca	7-9	1052
Királyi Pál utca	4	1053
Királyi Pál utca	2	1053
Kecskeméti utca	3	1053
Váci utca	23	1052
Városház utca	9	1052
Városház utca	11	1052
Váci utca	4	1052
Vitkovics Mihály utca	7	1052
Báthory utca	24	1054
Kossuth Lajos tér	13-15	1055
Váci utca	83	1056
Zoltán utca	2-4	1054
Párizsi utca	2	1052
József nádor tér	7	1051
Semmelweis utca	17	1052
Sas utca	4	1051
Gerlóczy utca	2	1052
Gerlóczy utca	6	1052
Gerlóczy utca	4	1052
Sas utca	25	1051
Aranykéz utca	6	1052
Jane Haining rakpart	8/a	1052
Aulich utca	3	1054
Aulich utca	1	1054
Váci utca	56-58	1056
Ferenczy István utca	5	1053
Petőfi Sándor utca	3	1052
Bajcsy-Zsilinszky út	58	1054
Bajcsy-Zsilinszky út	64	1054
Bajcsy-Zsilinszky út	34	1054
Bajcsy-Zsilinszky út	48	1054
Bajcsy-Zsilinszky út	50	1054
Bajcsy-Zsilinszky út	54	1054
Bajcsy-Zsilinszky út	56	1054
Szemere utca	4	1054
Szemere utca	5	1054
Kálmán Imre utca	11	1054
Kálmán Imre utca	9	1054
Kálmán Imre utca	8	1054
Kálmán Imre utca	13	1054
Kálmán Imre utca	21	1054
Bajcsy-Zsilinszky út	62	1054
Alkotmány utca	18	1054
Alkotmány utca	16	1054
Alkotmány utca	14	1054
Alkotmány utca	21	1054
Alkotmány utca	15	1054
Bajcsy-Zsilinszky út	52	1054
Bajcsy-Zsilinszky út	68	1054
Alkotmány utca	29	1054
Kálmán Imre utca	7	1054
Kálmán Imre utca	5	1054
Honvéd utca	12	1054
Honvéd utca	10	1054
Kálmán Imre utca	3	1054
Honvéd utca	9	1054
Kálmán Imre utca	6	1054
Kálmán Imre utca	4	1054
Kálmán Imre utca	14	1054
Kálmán Imre utca	16	1054
Kálmán Imre utca	24	1054
Kálmán Imre utca	26	1054
Vadász utca	21	1054
Vadász utca	36	1054
Vadász utca	35a	1054
Vadász utca	35b	1054
Vadász utca	38	1054
Vadász utca	37	1054
Arany János utca	35	1051
Arany János utca	33	1051
Podmaniczky Frigyes tér	3	1054
Podmaniczky Frigyes tér	5	1054
Vadász utca	18	1054
Vadász utca	20	1054
Vadász utca	9a	1054
Vadász utca	9b	1054
Vadász utca	22-24	1054
Vadász utca	23-25	1054
Vadász utca	19	1054
Városház utca	6	1052
Piarista utca	8	1052
Váci utca	29	1052
Apáczai Csere János utca	10	1051
Vigadó tér	1	1051
Apáczai Csere János utca	2	1051
Apáczai Csere János utca	8	1051
Deák Ferenc utca	8	1052
Deák Ferenc utca	6	1052
Deák Ferenc utca	2	1052
Galamb utca	9	1052
Régi posta utca	2	1052
Wekerle Sándor utca	1	1051
Deák Ferenc tér	4-5	1052
Vármegye utca	17	1052
Gerlóczy utca	3	1052
Gerlóczy utca	11	1052
Semmelweis utca	25	1052
Semmelweis utca	1-3	1052
Wekerle Sándor utca	5	1051
Dorottya utca	3	1051
Magyar utca	13	1053
Fővám tér	1	1056
Régi posta utca	14	1052
Arany János utca	7	1051
Zrínyi utca	2	1051
Október 6. utca	4	1051
József nádor tér	12	1051
Zoltán utca	9	1054
Zoltán utca	7	1054
Váci utca	18	1052
Váci utca	85	1056
Fővám tér	3	1056
Fővám tér	2	1056
Molnár utca	53	1056
Havas utca	3	1056
Belgrád rakpart	5	1056
Belgrád rakpart	1	1056
Zrínyi utca	13	1051
Zrínyi utca	11	1051
Zrínyi utca	7	1051
Sas utca	10-12	1051
Arany János utca	13	1051
Október 6. utca	13	1051
Sas utca	10	1051
Zrínyi utca	6	1051
Október 6. utca	16	1051
Október 6. utca	9	1051
Október 6. utca	1	1051
Október 6. utca	7	1051
Október 6. utca	10	1051
Október 6. utca	12	1051
Zrínyi utca	8-10	1051
Nádor utca	9	1051
Hercegprímás utca	13	1051
József nádor tér	11	1051
Bécsi utca	6	1052
Bécsi utca	8	1052
Bécsi utca	10	1052
Vörösmarty tér	5	1051
Vörösmarty tér	4	1051
Bécsi utca	4	1052
Deák Ferenc utca	7-9	1052
Türr István utca	7	1052
Türr István utca	9	1052
Türr István utca	5	1052
Türr István utca	3	1052
Türr István utca	8	1052
Türr István utca	6	1052
Deák Ferenc utca	1	1052
Vigadó utca	6	1051
Vigadó utca	4	1051
Vigadó utca	2	1051
Apáczai Csere János utca	13	1051
Apáczai Csere János utca	11	1051
Dorottya utca	2/a	1051
Dorottya utca	2/b	1051
Dorottya utca	4	1051
Wekerle Sándor utca	3	1051
Károly körút	8	1052
Régi posta utca	4	1052
Haris köz	3	1052
Hold utca	23	1054
Kecskeméti utca	11	1053
Balassi Bálint utca	19	1055
Papnövelde utca	2	1053
Szalay utca	5/a	1055
Kossuth Lajos tér	6	1055
Falk Miksa utca	34	1055
Hercegprímás utca	8	1051
Aranykéz utca	3	1052
Balassi Bálint utca	9-11	1055
Hold utca	10	1054
Hercegprímás utca	10	1051
Hercegprímás utca	22	1051
Arany János utca	28	1051
József Attila utca	24	1051
Dorottya utca	7	1051
Falk Miksa utca	7	1055
Markó utca	11	1055
Szalay utca	13	1055
Szalay utca	3	1055
Szalay utca	16	1055
Szalay utca	7/a	1055
Apáczai Csere János utca	15/1	1051
Apáczai Csere János utca	15/2	1051
Aranykéz utca	7	1052
Párizsi utca	9	1052
Haris köz	5	1052
Haris köz	1/a	1052
Molnár utca	4	1056
Sas utca	13	1051
Sas utca	15	1051
József nádor tér	10	1051
Petőfi Sándor utca	20	1052
Akadémia utca	2	1054
Akadémia utca	1	1054
Akadémia utca	11	1054
Széchenyi utca	1/d	1054
Széchenyi utca	1/a	1054
Széchenyi utca	16	1054
Széchenyi utca	7-9	1054
Széchenyi utca	7	1054
Vigyázó Ferenc utca	8	1051
Vigyázó Ferenc utca	2	1051
Mérleg utca	3	1051
Mérleg utca	14	1051
Alkotmány utca	1	1054
Kossuth Lajos tér	4	1055
Kossuth Lajos tér	5	1055
Kossuth Lajos tér	9	1055
Széchenyi rakpart	9	1054
Garibaldi utca	6	1054
Zoltán utca	8	1054
Garibaldi utca	3	1054
Akadémia utca	20	1054
Akadémia utca	18	1054
Akadémia utca	6	1054
Széchenyi rakpart	3	1054
Széchenyi rakpart	6	1054
Hold utca	5	1054
Só utca	1	1056
Fehér Hajó utca	12-14	1052
Alkotmány utca	2	1054
Szemere utca	10	1054
Szemere utca	7	1054
Szemere utca	11	1054
Szemere utca	15	1054
Honvéd tér	10	1055
Honvéd tér	10/a	1055
Honvéd tér	10/b	1055
Stollár Béla utca	3/a	1055
Stollár Béla utca	3/b	1055
Honvéd utca	28	1055
Bihari János utca	2	1055
Bihari János utca	8	1055
Nagy Ignác utca	10	1055
Nagy Ignác utca	6-8	1055
Balaton utca	4	1055
Balaton utca	10	1055
Honvéd utca	27	1055
Honvéd utca	29	1055
Balaton utca	13	1055
Balaton utca	15	1055
Balaton utca	17	1055
Balaton utca	19	1055
Balaton utca	22-24	1055
Honvéd utca	19	1055
Honvéd utca	22/a	1055
Honvéd utca	22/b	1055
Balaton utca	16	1055
Balaton utca	8	1055
Stollár Béla utca	15	1055
Károly körút	20	1052
Nádor utca	31	1051
Zrínyi utca	5	1051
Semmelweis utca	10	1052
Vitkovics Mihály utca	12	1052
Vitkovics Mihály utca	10	1052
Vadász utca	26	1054
Szabadság tér	7	1054
Semmelweis utca	6	1052
Városház utca	7	1052
Városház utca	12	1052
Városház utca	20	1052
Városház utca	14	1052
Pilvax köz	4	1052
Pilvax köz	2	1052
Pilvax köz	1	1052
Pilvax köz	3	1052
Váci utca	36	1056
Széchenyi utca	1	1054
Zoltán utca	11	1054
Nádor utca	32	1051
Bajcsy-Zsilinszky út	22	1051
Kossuth Lajos utca	6	1053
Szent István tér	1	1365
Bajcsy-Zsilinszky út	14	1365
Október 6. utca	18	1051
Arany János utca	12	1051
Arany János utca	23	1051
Sas utca	16	1051
Párizsi utca	7	1052
Szervita tér	8	1052
Bárczy István utca	2-4	1052
Bécsi utca	1-3	1052
Szervita tér	2	1052
Bécsi utca	2	1052
Apáczai Csere János utca	12-14	1051
Október 6. utca	11	1051
Bajcsy-Zsilinszky út	16	1051
Károlyi utca	12	1053
Kossuth Lajos utca	18	1053
Gerlóczy utca	1	1052
Báthory utca	23	1054
Belgrád rakpart	19	1056
Szerb utca	3	1056
Wekerle Sándor utca	5	1051
Vitkovics Mihály utca	3-5	1052
Szabadság tér	1	1054
Bank utca	1	1054
Hercegprímás utca	21	1051
Steindl Imre utca	11	1054
Nádor utca	26	1051
Zoltán utca	10	1054
Garibaldi utca	1	1054
Széchenyi utca	12	1054
Báthory utca	5	1054
Báthory utca	3	1054
Báthory utca	4	1054
Aulich utca	5	1054
Báthory utca	15	1054
Báthory utca	25	1054
Báthory utca	20	1054
Báthory utca	22	1054
Szalay utca	4	1055
Hold utca	3	1054
Arany János utca	22	1051
Falk Miksa utca	10	1055
Falk Miksa utca	6	1055
Markó utca	1/b	1055
Balassi Bálint utca	2/b	1055
Balassi Bálint utca	2	1055
Szemere utca	21	1054
Szalay utca	2	1055
Markó utca	4	1055
Falk Miksa utca	18-20	1055
Falk Miksa utca	22	1055
Falk Miksa utca	24-26	1055
Falk Miksa utca	13	1055
Nyugati tér	8	1055
Bajcsy-Zsilinszky út	76	1055
Nyugati tér	7	1055
Nyugati tér	6	1055
Arany János utca	18	1051
Hercegprímás utca	19	1051
Sas utca	24	1051
Mérleg utca	9	1051
Mérleg utca	7	1051
József Attila utca	12	1051
József Attila utca	10	1051
Dorottya utca	11	1051
Vigadó utca	4-6	1051
Vadász utca	24	1054
Mérleg utca	10	1051
Steindl Imre utca	7	1054
Arany János utca	29	1051
Zrínyi utca	10	1051
Szent István tér	11	1051
Szent István tér	7-9	1051
Szent István tér	6	1051
Szent István tér	2	1365
Sas utca	12	1051
Sas utca	6	1051
Sas utca	21	1051
Szent István tér	12	1051
Hercegprímás utca	11	1051
Hercegprímás utca	6	1051
Hercegprímás utca	1	1051
Sas utca	5	1051
Erzsébet tér	2	1051
József nádor tér	10-11	1051
Váci utca	1-3	1052
Kristóf tér	6	1052
Zrínyi utca	14	1051
Szervita tér	8	1052
Bárczy István utca	10	1052
Apáczai Csere János utca	3	1051
Apáczai Csere János utca	5	1051
Aranykéz utca	4-6	1052
Aranykéz utca	1	1052
Aranykéz utca	3	1052
Petőfi Sándor utca	17	1052
Veres Pálné utca	31	1053
Gerlóczy utca	9	1052
Semmelweis utca	8	1052
Vármegye utca	7	1052
Kossuth Lajos utca	14-16	1053
Kossuth Lajos utca	8	1053
Kossuth Lajos utca	10	1053
Károly körút	2	1052
Semmelweis utca	9	1052
Semmelweis utca	7	1052
Gerlóczy utca	13	1052
Károly körút	20	1052
Petőfi Sándor utca	2-4	1052
Kígyó utca	8	1052
Galamb utca	7	1052
Galamb utca	3	1052
Haris köz	6	1052
Párizsi utca	1	1052
Párizsi utca	6/a-b	1052
Vitkovics Mihály utca	7	1052
Deák Ferenc tér	4	1052
József nádor tér	7	1051
Gerlóczy utca	6	1052
Deák Ferenc tér	4-5	1052
`.trim();

async function main() {
  console.log('🚀 V. kerületi címek importálása kezdődik...\n');

  // Parse the data
  const lines = addressesData.split('\n').filter(line => line.trim());
  console.log(`📊 Összesen ${lines.length} cím található\n`);

  // First, ensure we have a district and streets
  const district = await prisma.district.upsert({
    where: { number: 5 },
    update: { name: 'Budapest V. kerület (Belváros-Lipótváros)' },
    create: {
      number: 5,
      name: 'Budapest V. kerület (Belváros-Lipótváros)',
    },
  });

  console.log(`✅ Kerület létrehozva/frissítve: ${district.name}\n`);

  // Collect unique streets
  const streetMap = new Map<string, Set<string>>();

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const streetName = parts[0].trim();
      const houseNumber = parts[1].trim();
      const postalCode = parts[2].trim();

      if (!streetMap.has(streetName)) {
        streetMap.set(streetName, new Set());
      }
      streetMap.get(streetName)!.add(`${houseNumber}|${postalCode}`);
    }
  }

  console.log(`🏙️  Egyedi utcák száma: ${streetMap.size}\n`);

  let streetCount = 0;
  let addressCount = 0;

  // Helper function to determine street type
  function getStreetType(streetName: string): string {
    if (streetName.includes('utca')) return 'UTCA';
    if (streetName.includes('tér')) return 'TER';
    if (streetName.includes('körút')) return 'KORUT';
    if (streetName.includes('sugárút')) return 'SUGURUT';
    if (streetName.includes('fasor')) return 'FASOR';
    if (streetName.includes('sétány')) return 'SETANY';
    if (streetName.includes('rakpart')) return 'RAKPART';
    if (streetName.includes('köz')) return 'KOCSUT';
    if (streetName.includes('lépcső')) return 'LEPCSO';
    if (streetName.includes('út')) return 'UTCA'; // "út" is often UTCA type
    return 'OTHER';
  }

  // Create streets and addresses
  for (const [streetName, houses] of streetMap.entries()) {
    // Create or get street
    const streetType = getStreetType(streetName);

    const street = await prisma.street.upsert({
      where: {
        name_districtId: {
          name: streetName,
          districtId: district.id,
        },
      },
      update: {},
      create: {
        name: streetName,
        streetType: streetType,
        districtId: district.id,
      },
    });

    streetCount++;

    // Create addresses for this street
    for (const houseData of houses) {
      const [houseNumber, postalCode] = houseData.split('|');

      // Parse house number to int if possible
      const houseNumMatch = houseNumber.match(/^\d+/);
      const houseNumberInt = houseNumMatch ? parseInt(houseNumMatch[0]) : null;

      try {
        await prisma.address.upsert({
          where: {
            streetId_houseNumber: {
              streetId: street.id,
              houseNumber: houseNumber,
            },
          },
          update: {
            postalCode: postalCode,
          },
          create: {
            streetId: street.id,
            houseNumber: houseNumber,
            houseNumberInt: houseNumberInt,
            postalCode: postalCode,
            isActive: true,
          },
        });
        addressCount++;
      } catch (error) {
        console.error(`❌ Hiba a cím létrehozásakor: ${streetName} ${houseNumber}`, error);
      }
    }

    if (streetCount % 10 === 0) {
      console.log(`⏳ Feldolgozva: ${streetCount} utca, ${addressCount} cím`);
    }
  }

  console.log('\n✨ Import befejezve!');
  console.log(`📍 Létrehozott utcák: ${streetCount}`);
  console.log(`🏠 Létrehozott címek: ${addressCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Hiba történt:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
