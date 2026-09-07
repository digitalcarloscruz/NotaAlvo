import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: mocks.from }) }));
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  const query = { select: vi.fn().mockReturnThis(), eq: mocks.eq, order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: mocks.maybeSingle };
  mocks.from.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
});

it("never recovers a lead using a self-declared email", async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { id: "current-user", email: "someone@example.com", email_confirmed_at: null } } });
  mocks.maybeSingle.mockResolvedValue({ data: { id: "own-order", attempt: { answers: [1] } }, error: null });
  const response = await GET();
  expect(response.status).toBe(200);
  expect(mocks.from).toHaveBeenCalledExactlyOnceWith("asaas_orders");
  expect(mocks.eq).toHaveBeenCalledExactlyOnceWith("user_id", "current-user");
  expect(await response.json()).toEqual({ data: { id: "own-order", attempt: { answers: [1] } } });
});

it("returns no quiz when the account has no order, even if the email matches a contact", async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { id: "new-user", email: "someone@example.com" } } });
  mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
  expect(await (await GET()).json()).toEqual({ data: null });
  expect(mocks.from).not.toHaveBeenCalledWith("enem_quiz_contacts");
});

it("rejects anonymous recovery before querying orders", async () => {
  mocks.getUser.mockResolvedValue({ data: { user: null } });
  expect((await GET()).status).toBe(401);
  expect(mocks.from).not.toHaveBeenCalled();
});
