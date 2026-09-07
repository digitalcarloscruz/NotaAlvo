import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
it("requires a correct answer in the due cycle and cannot advance twice on retry", async () => {
  const db = new PGlite();
  const id = "00000000-0000-4000-8000-000000000001";
  try {
    await db.exec("create role anon; create role authenticated; create role service_role; create table review_queue(id uuid primary key,user_id uuid,question_id uuid,status text,interval_step smallint,due_at timestamptz,last_reviewed_at timestamptz,updated_at timestamptz); create table user_answers(user_id uuid,question_id uuid,is_correct boolean,answered_at timestamptz);");
    await db.exec(readFileSync("supabase/migrations/20260907190000_review_progress_guard.sql", "utf8"));
    await db.query("insert into review_queue values ($1,$1,$1,'scheduled',1,now()-interval '1 day',null,now())", [id]);
    await expect(db.query("select * from advance_review_item($1,$1)", [id])).rejects.toThrow("review_answer_required");
    await db.query("insert into user_answers values($1,$1,true,now())", [id]);
    const first = await db.query("select * from advance_review_item($1,$1)", [id]);
    expect(first.rows[0]).toMatchObject({ interval_step: 2, status: "scheduled" });
    const retry = await db.query("select * from advance_review_item($1,$1)", [id]);
    expect(retry.rows).toEqual(first.rows);
  } finally { await db.close(); }
});
