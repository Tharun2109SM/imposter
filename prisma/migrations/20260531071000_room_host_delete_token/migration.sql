-- Store a host-only token used to authorize destructive room deletion.
ALTER TABLE "Room" ADD COLUMN "hostDeleteToken" TEXT;

UPDATE "Room"
SET "hostDeleteToken" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "hostDeleteToken" IS NULL;

ALTER TABLE "Room" ALTER COLUMN "hostDeleteToken" SET NOT NULL;
