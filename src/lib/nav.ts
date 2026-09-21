import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileQuestion,
  FolderOpen,
  User,
  Users,
  UserCog,
  Inbox,
  Quote,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const studentNav: NavItem[] = [
  { href: "/student", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/student/mock-tests", label: "Mock Tests", icon: FileQuestion },
  { href: "/student/materials", label: "Materials", icon: FolderOpen },
  { href: "/student/profile", label: "Profile", icon: User },
];

export const prospectorNav: NavItem[] = [
  { href: "/prospector", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/prospector/students", label: "Students", icon: Users },
  { href: "/prospector/courses", label: "Courses", icon: BookOpen },
  { href: "/prospector/materials", label: "Materials", icon: FolderOpen },
  { href: "/prospector/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/prospector/mock-tests", label: "Mock Tests", icon: FileQuestion },
  { href: "/prospector/profile", label: "Profile", icon: User },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/prospectors", label: "Prospectors", icon: UserCog },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/profile", label: "Profile", icon: User },
];
