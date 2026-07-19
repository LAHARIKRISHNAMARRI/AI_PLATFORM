import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { teacherNav } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { signedMaterialUrl } from "@/lib/materials.functions";

export const Route = createFileRoute("/_authenticated/teacher/uploads")({
  head: () => ({ meta: [{ title: "Uploads — TeachLearn AI" }] }),
  component: Uploads,
});

function Uploads() {
  const sign = useServerFn(signedMaterialUrl);
  const { data } = useQuery({
    queryKey: ["teacher-uploads"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const { data } = await supabase
        .from("materials")
        .select("id,title,material_type,subject,class_name,storage_path,created_at,file_size")
        .eq("uploaded_by", uid)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <PortalShell role="teacher" nav={teacherNav} title="Uploads" breadcrumbs={["Home", "Uploads"]}>
      <div className="rounded-2xl bg-card border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground text-left">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((m) => (
              <tr key={m.id} className="border-t hover:bg-secondary/40">
                <td className="py-3 px-4 font-medium">{m.title}</td>
                <td className="py-3 px-4"><Badge variant="secondary" className="capitalize">{m.material_type.replace("_", " ")}</Badge></td>
                <td className="py-3 px-4">{m.subject}</td>
                <td className="py-3 px-4">{m.class_name}</td>
                <td className="py-3 px-4">{m.file_size ? Math.round(m.file_size / 1024) + " KB" : "-"}</td>
                <td className="py-3 px-4">
                  <Button size="sm" variant="ghost" onClick={async () => {
                    const { url } = await sign({ data: { path: m.storage_path } });
                    window.open(url, "_blank");
                  }}>
                    <Download className="size-4 mr-1" /> Open
                  </Button>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No uploads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}