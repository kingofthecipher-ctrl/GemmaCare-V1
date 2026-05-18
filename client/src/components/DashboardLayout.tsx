import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { Activity, Clock, LayoutDashboard, LogOut, PanelLeft, Info, Terminal, Loader2, Pill, Globe, ChevronDown, Sun, Moon } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/languages";

// menuItems defined inside component

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

function GlobalLangPicker({ collapsed }: { collapsed: boolean }) {
  const { uiLang, setUiLang, nativeName, langName } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const groups = Object.entries(SUPPORTED_LANGUAGES).reduce<Record<string, Array<[string, any]>>>((acc, [code, info]) => {
    const r = (info as any).region ?? "Other";
    if (!acc[r]) acc[r] = [];
    acc[r].push([code, info]);
    return acc;
  }, {});

  const filtered = search.trim()
    ? Object.entries(SUPPORTED_LANGUAGES).filter(([code, info]) =>
        (info as any).name.toLowerCase().includes(search.toLowerCase()) ||
        (info as any).nativeName.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  if (collapsed) return (
    <button onClick={() => setOpen(o => !o)} className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors mx-auto" title={`${nativeName} — ${langName}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
    </button>
  );

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors text-left border border-transparent hover:border-border">
        <Globe className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">App Language</p>
          <p className="text-sm font-medium truncate">{nativeName} — {langName}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 border-b border-border">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search 35+ languages…"
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus />
            </div>
            <div className="overflow-y-auto max-h-64">
              {filtered ? (
                <div className="p-1">
                  {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No results</p>}
                  {filtered.map(([code, info]) => (
                    <button key={code} onClick={() => { setUiLang(code as LanguageCode); setOpen(false); setSearch(""); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors flex justify-between items-center gap-2 ${uiLang === code ? "bg-primary/10 text-primary font-medium" : ""}`}>
                      <span>{(info as any).nativeName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{(info as any).name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                Object.entries(groups).map(([region, langs]) => (
                  <div key={region}>
                    <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 sticky top-0">{region}</p>
                    {langs.map(([code, info]) => (
                      <button key={code} onClick={() => { setUiLang(code as LanguageCode); setOpen(false); setSearch(""); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex justify-between items-center gap-2 ${uiLang === code ? "bg-primary/10 text-primary font-medium" : ""}`}>
                        <span>{(info as any).nativeName}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{(info as any).name}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const s = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return s ? parseInt(s, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const { theme, toggleTheme, t } = useLanguage();
  const menuItems = useMemo(() => [
    { section: t.clinical, items: [
      { icon: Activity, label: t.triage,      path: "/triage" },
      { icon: Pill,     label: t.medications, path: "/medications" },
      { icon: Clock,    label: t.history,     path: "/history" },
    ]},
    { section: t.info, items: [
      { icon: LayoutDashboard, label: t.demoCases, path: "/demo" },
      { icon: Info,            label: t.about,      path: "/about" },
    ]},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t]);
  const activeMenuItem = useMemo(
    () => menuItems.flatMap(s => s.items).find(i => i.path === location),
    [menuItems, location]
  );

  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); }, [sidebarWidth]);

  const utils = trpc.useUtils();
  const [autoLoginDone, setAutoLoginDone] = useState(false);

  // Auto-login: silently set the session cookie on first load — no click needed.
  // Works 100% offline; /api/auth/local-login?noRedirect=1 returns JSON + sets cookie.
  useEffect(() => {
    if (loading || user || autoLoginDone) return;
    setAutoLoginDone(true);
    fetch("/api/auth/local-login?noRedirect=1", { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(() => utils.auth.me.invalidate())
      .catch(() => {/* server not ready yet — manual button still shown */});
  }, [loading, user, autoLoginDone, utils]);

  if (loading || (!user && !autoLoginDone)) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <button onClick={toggleTheme} className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-blue-500" />}
          </button>
        </div>
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <img src="/logo-icon.png" alt="" className="h-20 w-20 object-contain" />
            <div className="text-center">
              <h1 className="text-3xl font-bold" style={{ background: "linear-gradient(135deg, #2196F3, #4CAF50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GemmaCare</h1>
              <p className="text-sm text-muted-foreground mt-1">Powered by Gemma 4 E4B · Fully Local</p>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-border bg-card p-6 space-y-4 shadow-lg">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Welcome</h2>
              <p className="text-sm text-muted-foreground">Clinical triage in 140 languages. All AI runs locally via Ollama — no internet required.</p>
            </div>
            <Button className="w-full h-11 font-semibold" style={{ background: "linear-gradient(135deg, #2196F3, #4CAF50)" }}
              disabled={signingIn} onClick={() => { setSigningIn(true); window.location.href = "/api/auth/local-login"; }}>
              {signingIn ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Signing in…</> : <>{t.signIn}</>}
            </Button>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Ollama / Gemma 4 E4B</p>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.open("http://localhost:11434", "_blank")}>
                <Terminal className="h-3 w-3 mr-2"/>Check Ollama Status
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Make sure Ollama is running and <code className="bg-muted px-1.5 py-0.5 rounded font-mono">gemma4:e4b</code> is pulled.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (w: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { theme, toggleTheme, t } = useLanguage();
  const menuItems = useMemo(() => [
    { section: t.clinical, items: [
      { icon: Activity, label: t.triage,      path: "/triage" },
      { icon: Pill,     label: t.medications, path: "/medications" },
      { icon: Clock,    label: t.history,     path: "/history" },
    ]},
    { section: t.info, items: [
      { icon: LayoutDashboard, label: t.demoCases, path: "/demo" },
      { icon: Info,            label: t.about,      path: "/about" },
    ]},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t]);
  const activeMenuItem = useMemo(
    () => menuItems.flatMap(s => s.items).find(i => i.path === location),
    [menuItems, location]
  );

  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const w = e.clientX - left;
      if (w >= MIN_WIDTH && w <= MAX_WIDTH) setSidebarWidth(w);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-border" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center border-b border-border px-3">
            <div className="flex items-center gap-3 w-full">
              <button onClick={toggleSidebar} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors shrink-0">
                <PanelLeft className="h-4 w-4 text-muted-foreground"/>
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img src="/logo-icon.png" alt="" className="h-7 w-auto shrink-0" />
                  <span className="font-bold text-base truncate" style={{ background: "linear-gradient(135deg, #2196F3, #4CAF50)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GemmaCare</span>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-2">
            {menuItems.map((section, i) => (
              <div key={i} className="py-1">
                {!isCollapsed && <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{section.section}</div>}
                <SidebarMenu className="px-2">
                  {section.items.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label}
                          className={`h-10 font-medium rounded-lg transition-all ${isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"}`}>
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}/>
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}

            {!isCollapsed && (
              <div className="py-1">
                <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Engine</div>
                <SidebarMenu className="px-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => window.open("http://localhost:11434", "_blank")} tooltip="Ollama" className="h-10 text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Terminal className="h-4 w-4"/><span>Ollama Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigator.clipboard?.writeText("ollama run gemma4:e4b")} tooltip="Copy launch command" className="h-10 text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Activity className="h-4 w-4"/><span>Launch Gemma 4 E4B</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="p-3 space-y-2 border-t border-border">
            <GlobalLangPicker collapsed={isCollapsed} />

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors ${isCollapsed ? "justify-center" : ""}`}>
              {theme === "dark"
                ? <Sun className="h-4 w-4 text-yellow-400 shrink-0"/>
                : <Moon className="h-4 w-4 text-blue-500 shrink-0"/>}
              {!isCollapsed && <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left focus:outline-none">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                      {(user?.name ?? "L").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-none">{user?.name || "Local User"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{user?.email || "local session"}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4"/><span>{t.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }} style={{ zIndex: 50 }}/>
      </div>

      <SidebarInset className="bg-background">
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-background/95 px-3 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg"/>
              <img src="/logo-icon.png" alt="" className="h-6 w-6 object-contain"/>
              <span className="font-semibold">{activeMenuItem?.label ?? "GemmaCare"}</span>
            </div>
            <button onClick={toggleTheme} className="h-8 w-8 rounded-full border border-border flex items-center justify-center">
              {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-yellow-400"/> : <Moon className="h-3.5 w-3.5 text-blue-500"/>}
            </button>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6 max-w-5xl">{children}</main>
      </SidebarInset>
    </>
  );
}
