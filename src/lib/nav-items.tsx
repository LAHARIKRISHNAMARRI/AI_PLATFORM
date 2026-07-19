import {
  BarChart3,
  Book,
  BookOpen,
  Brain,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/portal/PortalShell";

export const teacherNav: NavItem[] = [
  { label: "Dashboard", to: "/teacher", icon: <LayoutDashboard className="size-4" /> },
  { label: "My Sessions", to: "/teacher/sessions", icon: <Calendar className="size-4" /> },
  { label: "Schedule Session", to: "/teacher/schedule", icon: <ClipboardList className="size-4" /> },
  { label: "Uploads", to: "/teacher/uploads", icon: <Upload className="size-4" /> },
  { label: "Question Generation", to: "/teacher/question-generation", icon: <Sparkles className="size-4" /> },
  { label: "Students & Class", to: "/teacher/students", icon: <Users className="size-4" /> },
  { label: "Exams", to: "/teacher/exams", icon: <ListChecks className="size-4" /> },
  { label: "Doubts", to: "/teacher/doubts", icon: <MessageCircleQuestion className="size-4" /> },
  { label: "Leaves", to: "/teacher/leaves", icon: <FileText className="size-4" /> },
];

export const studentNav: NavItem[] = [
  { label: "Dashboard", to: "/student", icon: <LayoutDashboard className="size-4" /> },
  { label: "My Lectures", to: "/student/lectures", icon: <BookOpen className="size-4" /> },
  { label: "Assessments", to: "/student/assessments", icon: <ListChecks className="size-4" /> },
  { label: "Study Materials", to: "/student/materials", icon: <Book className="size-4" /> },
  { label: "Ask Doubt", to: "/student/ask-doubt", icon: <MessageCircleQuestion className="size-4" /> },
  { label: "My Progress", to: "/student/progress", icon: <BarChart3 className="size-4" /> },
  { label: "AI Learning Hub", to: "/student/ai-hub", icon: <Brain className="size-4" /> },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: <LayoutDashboard className="size-4" /> },
  { label: "Teachers", to: "/admin/teachers", icon: <GraduationCap className="size-4" /> },
  { label: "Students", to: "/admin/students", icon: <Users className="size-4" /> },
  { label: "Leaves", to: "/admin/leaves", icon: <FileText className="size-4" /> },
  { label: "Access", to: "/admin/access", icon: <ShieldCheck className="size-4" /> },
];