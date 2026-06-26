import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { OverviewClient } from "./overview-client";

export default async function DashboardPage() {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  const supabase = createClient();

  const { data: wtns } = await supabase
    .from("wtns")
    .select("id, reference_number, status, transfer_date, waste_description, ewc_code, pdf_path, wtn_parties(company_name, party_type)")
    .eq("workspace_id", workspaceId)
    .eq("status", "final")
    .order("created_at", { ascending: false })
    .limit(200);

  const signedUrls: Record<string, string> = {};
  for (const wtn of wtns ?? []) {
    if (wtn.pdf_path) {
      const { data } = await supabase.storage.from("wtn-private").createSignedUrl(wtn.pdf_path, 3600);
      if (data?.signedUrl) signedUrls[wtn.id] = data.signedUrl;
    }
  }

  return <OverviewClient wtns={(wtns ?? []) as any} signedUrls={signedUrls} canWrite={canWrite} />;
}
