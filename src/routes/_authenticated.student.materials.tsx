import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { studentNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { signedMaterialUrl } from "@/lib/materials.functions";

export const Route = createFileRoute("/_authenticated/student/materials")({
  head: () => ({ meta: [{ title: "Study Materials — TeachLearn AI" }] }),
  component: Materials,
});

function Materials() {
  const sign = useServerFn(signedMaterialUrl);
  const { data } = useQuery({
    queryKey: ["student-materials"],
    queryFn: async () => {
      const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PortalShell role="student" nav={studentNav} title="Study Materials" breadcrumbs={["Home", "Materials"]}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className="rounded-2xl bg-card border p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg stat-pill-violet flex items-center justify-center"><FileText className="size-5" /></div>
              <div className="min-w-0">
                <div className="font-medium truncate">{m.title}</div>
                <div className="text-xs text-muted-foreground truncate">{m.subject}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant="secondary" className="capitalize">{m.material_type.replace("_", " ")}</Badge>
              <Button size="sm" variant="ghost" onClick={async () => {
                const { url } = await sign({ data: { path: m.storage_path } });
                window.open(url, "_blank");
              }}><Download className="size-4 mr-1" /> Open</Button>
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && <div className="text-muted-foreground col-span-full">No materials available yet.</div>}
      </div>
    </PortalShell>
  );
}