ALTER TABLE "Video" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

WITH ordered_videos AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (ORDER BY "createdAt" DESC, "id" ASC) - 1 AS "sortOrder"
    FROM "Video"
)
UPDATE "Video"
SET "sortOrder" = ordered_videos."sortOrder"
FROM ordered_videos
WHERE "Video"."id" = ordered_videos."id";

CREATE INDEX "Video_sortOrder_createdAt_idx" ON "Video"("sortOrder", "createdAt");
