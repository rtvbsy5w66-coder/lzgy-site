-- ============================================
-- Adatbázis Tisztító Script
-- ============================================
-- FIGYELEM: Ez törli az ÖSSZES content adatot!
-- Admin userek és auth adatok MEGMARADNAK
-- ============================================

BEGIN;

-- 1. User-generated content törlése
DELETE FROM "QuizAnswer";
DELETE FROM "QuizResult";
DELETE FROM "PollVote";
DELETE FROM "PollResult";
DELETE FROM "Signature";
DELETE FROM "EventRegistration";
DELETE FROM "NewsletterSubscription";
DELETE FROM "NewsletterAnalytics";

-- 2. Contact és Issue management törlése
DELETE FROM "IssueNotification";
DELETE FROM "IssueStatusUpdate";
DELETE FROM "ReportAttachment";
DELETE FROM "ReportHistory";
DELETE FROM "Report";
DELETE FROM "Issue";
DELETE FROM "Contact";

-- 3. Campaign és Newsletter törlése
DELETE FROM "SequenceLog";
DELETE FROM "SequenceExecution";
DELETE FROM "SequenceEmail";
DELETE FROM "CampaignSequence";
DELETE FROM "NewsletterCampaign";

-- 4. Content törlése (Posts, Events, Polls, Quizzes, Petitions)
DELETE FROM "QuizOption";
DELETE FROM "QuizQuestion";
DELETE FROM "Quiz";

DELETE FROM "PollOption";
DELETE FROM "Poll";

DELETE FROM "Post";

DELETE FROM "Event";

DELETE FROM "Signature";
DELETE FROM "Petition";

DELETE FROM "Slide";
DELETE FROM "Partner";

-- 5. Categories törlése (opcionális - ha újakat akarsz)
-- DELETE FROM "NewsCategory";
-- DELETE FROM "PetitionCategory";
-- DELETE FROM "IssueCategory";

-- 6. Themes és Settings MEGTARTÁSA (kommentezd ki ha törölni akarod)
-- DELETE FROM "Theme";
-- DELETE FROM "CategoryColor";
-- DELETE FROM "SiteSetting";

-- 7. Geographic data MEGTARTÁSA (kommentezd ki ha törölni akarod)
-- DELETE FROM "Address";
-- DELETE FROM "Street";
-- DELETE FROM "District";

-- 8. Users törlése (CSAK a non-admin userek)
DELETE FROM "User"
WHERE role != 'ADMIN'
  AND email NOT IN (
    'admin@lovaszoltan.hu',
    'plscallmegiorgio@gmail.com',
    'lovas.zoltan@mindenkimagyarorszaga.hu'
  );

-- 9. Sessions és Verification Tokens törlése
DELETE FROM "Session" WHERE "userId" NOT IN (
  SELECT id FROM "User" WHERE role = 'ADMIN'
);
DELETE FROM "VerificationToken";

COMMIT;

-- Statisztikák kiírása
SELECT
  'Quiz' as table_name, COUNT(*) as count FROM "Quiz"
UNION ALL
SELECT 'Post', COUNT(*) FROM "Post"
UNION ALL
SELECT 'Event', COUNT(*) FROM "Event"
UNION ALL
SELECT 'Poll', COUNT(*) FROM "Poll"
UNION ALL
SELECT 'Petition', COUNT(*) FROM "Petition"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Admin', COUNT(*) FROM "Admin";
