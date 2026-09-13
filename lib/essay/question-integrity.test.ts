import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
it("quarantines automatic incomplete items without changing human curation or answer content", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create table questions(id text,statement text,options jsonb,validation_status text,validation_notes text,updated_at timestamptz,provenance jsonb); create table enem_archive_items(id text,extraction_status text,statement text,options jsonb);");
    await db.exec(`insert into questions values ('auto','Segundo o texto anterior, qual é a conclusão?', '["A","B"]','validated',null,null,'{"validationMethod":"automated_official_extraction","archiveItemId":"a"}'), ('human','Segundo o texto anterior, qual é a conclusão?', '["A","B"]','validated',null,null,'{}'), ('later','Texto completo da questão sem erros aparentes.', '["A","B"]','validated',null,null,'{"validationMethod":"automated_official_extraction","archiveItemId":"b"}'); insert into enem_archive_items values ('b','ready','Texto', '[]');`);
    await db.exec(readFileSync("supabase/migrations/20260913123000_question_context_guard.sql", "utf8"));
    const status = async (id: string) => (await db.query<{ validation_status: string }>("select validation_status from questions where id=$1", [id])).rows[0].validation_status;
    expect(await status("auto")).toBe("pending");
    expect(await status("human")).toBe("validated");
    expect(await status("later")).toBe("validated");
    await db.exec("update enem_archive_items set extraction_status='needs_review' where id='b'");
    expect(await status("later")).toBe("pending");
    expect((await db.query<{ options: string[] }>("select options from questions where id='later'")).rows[0].options).toEqual(["A", "B"]);
  } finally { await db.close(); }
});
