import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — TeachLearn AI" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-12">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">TeachLearn AI</div>
            <div className="text-xs opacity-70 mt-1">Smart teaching & learning</div>
          </div>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Teach smarter.<br/>Learn deeper.
          </h1>
          <p className="mt-4 opacity-80 max-w-md">
            One portal for teachers, students, and admins — with AI that generates
            assessments, tutors students, and surfaces what to master next.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm opacity-80">
            <Sparkles className="size-4" /> Powered by Lovable AI
          </div>
        </div>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} TeachLearn AI</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <div className="font-display font-bold">TeachLearn AI</div>
          </div>
          <h2 className="font-display text-2xl font-bold">Welcome</h2>
          <p className="text-muted-foreground text-sm mt-1">Sign in or create an account to continue.</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm loading={loading} setLoading={setLoading} onDone={() => navigate({ to: "/" })} />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm loading={loading} setLoading={setLoading} onDone={() => navigate({ to: "/" })} />
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground mt-6">
            First account can claim admin from the dashboard.{" "}
            <Link to="/" className="text-primary underline-offset-4 hover:underline">Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ loading, setLoading, onDone }: { loading: boolean; setLoading: (b: boolean) => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      className="space-y-4 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) return toast.error(error.message);
        toast.success("Welcome back!");
        onDone();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="si-email">Email</Label>
        <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="si-password">Password</Label>
        <Input id="si-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}

function SignUpForm({ loading, setLoading, onDone }: { loading: boolean; setLoading: (b: boolean) => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  return (
    <form
      className="space-y-4 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              role,
              class_name: role === "student" ? className : null,
              subject: role === "teacher" ? subject : null,
              department: role === "teacher" ? subject : null,
            },
          },
        });
        setLoading(false);
        if (error) return toast.error(error.message);
        toast.success("Account created!");
        onDone();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="su-name">Full name</Label>
        <Input id="su-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-role">I am a</Label>
        <Select value={role} onValueChange={(v) => setRole(v as "student" | "teacher")}>
          <SelectTrigger id="su-role"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {role === "student" ? (
        <div className="space-y-2">
          <Label htmlFor="su-class">Class / Batch</Label>
          <Input id="su-class" placeholder="CS - 3rd Year - A" value={className} onChange={(e) => setClassName(e.target.value)} required />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="su-subject">Subject / Department</Label>
          <Input id="su-subject" placeholder="Computer Science" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="su-email">Email</Label>
        <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-password">Password</Label>
        <Input id="su-password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
    </form>
  );
}