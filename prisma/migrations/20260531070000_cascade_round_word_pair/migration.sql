-- Make room-owned rounds and word pairs cascade cleanly during room deletion.
ALTER TABLE "Round" DROP CONSTRAINT "Round_wordPairId_fkey";

ALTER TABLE "Round"
ADD CONSTRAINT "Round_wordPairId_fkey"
FOREIGN KEY ("wordPairId") REFERENCES "WordPair"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
