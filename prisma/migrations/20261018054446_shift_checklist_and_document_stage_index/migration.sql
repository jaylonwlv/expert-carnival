-- The previous migration (shift_existing_stages_for_lead_stage) shifted
-- every Client's currentStage by +1 for the new "Lead" stage, but missed
-- that ChecklistItem.stageIndex and Document.stageIndex are ALSO raw
-- indexes into the same STAGES array (set at creation time, from whatever
-- stage the client was on then) -- so a pre-existing client's checklist
-- items and documents are still tagged to their old, now-off-by-one stage,
-- and silently display grouped under the wrong stage's section.
--
-- ensureChecklistItems (src/lib/checklist.ts) can't self-correct this: its
-- short-circuit only compares key sets, not stageIndex values, so an
-- already-complete checklist is left untouched forever.
UPDATE "ChecklistItem" SET "stageIndex" = "stageIndex" + 1;
UPDATE "Document" SET "stageIndex" = "stageIndex" + 1 WHERE "stageIndex" IS NOT NULL;
