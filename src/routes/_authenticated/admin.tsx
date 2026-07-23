import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState, useMemo, Fragment } from "react";
import {
  Users,
  Car,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Search,
  Heart,
  ShoppingBag,
  Landmark,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Download,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap,
  CalendarDays,
  LineChart,
  ScanFace,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { supabase } from "@/integrations/supabase/client";
import { catalog, type CarStatus, fmtPrice } from "@/data/cars";
import { exportToCSV, logAdminAction, fmtDate, fmtDateTime, aggregateMonthlyRevenue } from "@/lib/admin-utils";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const user = (context as any).user;
    if (!user) {
      throw redirect({ to: "/auth" });
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) {
      throw redirect({ to: "/account" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

// ─────────────────────────────────────── Types ───────────────────────────────────────

type DealerApplication = {
  id: string;
  user_id: string;
  business_name: string;
  business_address: string;
  tax_id: string;
  inventory_focus: string;
  phone: string;
  website: string | null;
  message: string | null;
  id_file_path: string | null;
  status: "pending" | "approved" | "rejected";
  stripe_verification_session_id: string | null;
  verification_status: string | null;
  rejection_reason: string | null;
  resubmitted_at: string | null;
  created_at: string;
};

type UserProfile = {
  id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

type UserRole = { user_id: string; role: string };
type UserEmail = { user_id: string; email: string };
type SavedCar = { id: string; car_id: string; created_at: string };
type OrderRow = { id: string; car_id: string; car_name: string; amount: number; status: string; created_at: string };
type BankAcct = { id: string; bank_name: string; account_name: string; account_number: string; routing_number: string };
type AuditEntry = { id: string; admin_id: string; action: string; entity_type: string; entity_id: string | null; details: Record<string, unknown> | null; created_at: string };
type CarOverride = { id: string; car_id: string; status: CarStatus; updated_by: string; updated_at: string };

// ─────────────────────────────── Holding-ID Photo Viewer ─────────────────────────

function IDViewer({ filePath }: { filePath: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.storage
        .from("dealer-documents")
        .createSignedUrl(filePath, 3600);
      setUrl(data?.signedUrl ?? null);
      setLoading(false);
    })();
  }, [filePath]);

  if (loading) return <p className="mt-2 font-mono text-[10px] text-muted-foreground">Loading…</p>;
  if (!url) return <p className="mt-2 font-mono text-[10px] text-muted-foreground">Failed to load document</p>;

  const isImage = /\.(jpe?g|png|webp)$/i.test(filePath);
  const isPdf = /\.pdf$/i.test(filePath);

  return (
    <div className="mt-2">
      {isImage ? (
        <>
          <div
            className="relative cursor-pointer overflow-hidden border border-border/50 bg-neutral-900 group"
            onClick={() => setExpanded(!expanded)}
          >
            <img
              src={url}
              alt="Applicant holding their ID document"
              className={`w-full border-0 bg-neutral-900 object-contain transition-all duration-300 ${
                expanded ? "max-h-[80vh]" : "max-h-72"
              }`}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-sm bg-black/60 px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
              <ExternalLink className="size-3" />
              {expanded ? "Collapse" : "Expand"}
            </div>
          </div>
          {expanded && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 border border-border/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-accent transition-colors hover:border-accent"
            >
              <ExternalLink className="size-3" />
              Open full size
            </a>
          )}
        </>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 border border-border/50 px-3 py-2 font-mono text-[10px] text-accent hover:border-accent transition-colors">
          <ExternalLink className="size-3.5" />
          Open PDF
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────── Revenue Bar Chart ───────────────────────────────

function RevenueChart({ data }: { data: { month: string; revenue: number; count: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="border border-border bg-background p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <BarChart3 className="size-3.5 text-accent" />
            Monthly Revenue
          </p>
        </div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {data.length} months
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No revenue data yet</p>
        </div>
      ) : (
        <div className="flex h-48 items-end gap-2">
          {data.map((d) => (
            <div key={d.month} className="group relative flex flex-1 flex-col items-center justify-end h-full">
              <div
                className="w-full bg-accent/60 transition-all duration-500 hover:bg-accent relative"
                style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-surface border border-border/50 px-2 py-1 font-mono text-[9px]">
                  <p>${d.revenue.toLocaleString()}</p>
                  <p className="text-muted-foreground">{d.count} orders</p>
                </div>
              </div>
              <span className="mt-1.5 font-mono text-[7px] uppercase tracking-wider text-muted-foreground rotate-45 origin-left">
                {d.month.slice(5)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────── SVG Revenue Line Chart ───────────────────────────────

function RevenueLineChart({ data }: { data: { month: string; revenue: number; count: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 0 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const minRevenue = Math.min(...data.map((d) => d.revenue), 0);
  const range = Math.max(maxRevenue - minRevenue, 1);

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - ((d.revenue - minRevenue) / range) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${padding.top + chartH} L${points[0]?.x ?? 0},${padding.top + chartH} Z`;

  const hovered = hoveredIndex !== null ? points[hoveredIndex] ?? null : null;

  return (
    <div className="relative border border-border bg-background p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <LineChart className="size-3.5 text-accent" />
          Revenue Trend
        </p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {data.length} months
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No revenue data for this period</p>
        </div>
      ) : data.length === 1 ? (
        <div className="flex h-48 items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-mono text-[9px] text-accent">{data[0].month}</p>
            <p className="font-display text-3xl italic tracking-tight mt-1">${data[0].revenue.toLocaleString()}</p>
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mt-1">{data[0].count} orders</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Hover tooltip */}
          {hovered && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full bg-surface border border-border/50 px-3 py-2 transition-opacity"
              style={{ left: `${(hovered.x / width) * 100}%`, top: `${(hovered.y / height) * 100}%` }}
            >
              <p className="font-mono text-[9px] text-accent whitespace-nowrap">{hovered.month}</p>
              <p className="font-display text-sm italic tracking-tight">${hovered.revenue.toLocaleString()}</p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">{hovered.count} orders</p>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 overflow-visible"
            preserveAspectRatio="none"
            role="img"
            aria-label="Revenue line chart showing monthly revenue trends"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const y = padding.top + chartH - f * chartH;
              return (
                <g key={f}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="oklch(1 0 0 / 6%)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 4}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground font-mono text-[6px]"
                  >
                    ${(minRevenue + f * range).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="oklch(0.58 0.22 27 / 12%)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="oklch(0.58 0.22 27 / 80%)" strokeWidth="2" />

            {/* Dots */}
            {points.map((p, i) => (
              <g key={p.month}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? 5 : 3}
                  className={`cursor-pointer transition-all ${
                    hoveredIndex === i
                      ? "fill-accent stroke-background stroke-2"
                      : "fill-accent/60 hover:fill-accent"
                  }`}
                  onMouseEnter={() => setHoveredIndex(i)}
                />
              </g>
            ))}

            {/* X-axis labels */}
            {points.filter((_, i) => i % Math.max(Math.ceil(points.length / 8), 1) === 0 || i === points.length - 1).map((p) => (
              <text
                key={p.month}
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[6px] uppercase"
              >
                {p.month.slice(2)}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────── Stat Card ──────────────────────────────────────

function StatCard({ icon: Icon, value, label, sub, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-border p-5 transition-colors hover:border-accent/30 group">
      <Icon className={`mb-3 size-5 ${accent ? "text-accent" : "text-muted-foreground group-hover:text-accent"} transition-colors`} />
      <p className="font-display text-3xl italic tracking-tight">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────── Status Badge ───────────────────────────────────

function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const colors: Record<string, string> = {
    available: "bg-green-500/15 text-green-500 border-green-500/30",
    reserved: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    sold: "bg-destructive/15 text-destructive border-destructive/30",
    pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    approved: "bg-green-500/15 text-green-500 border-green-500/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    completed: "bg-green-500/15 text-green-500 border-green-500/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    customer: "bg-muted/20 text-muted-foreground border-border/30",
    dealer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    admin: "bg-accent/20 text-accent border-accent/30",
  };
  const cls = `inline-flex items-center gap-1.5 px-2 py-0.5 font-mono border ${
    size === "sm" ? "text-[9px] tracking-widest" : "text-[10px] tracking-wider"
  } ${colors[status.toLowerCase()] ?? "bg-muted/20 text-muted-foreground border-border/30"}`;

  return <span className={cls}>{status}</span>;
}

// ─────────────────────────────── Calendar Date Range Picker ─────────────────────

function CalendarFilter({ start, end, onChange }: {
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
}) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(() => end ? parseInt(end.slice(5, 7)) - 1 : now.getMonth());
  const [viewYear, setViewYear] = useState(() => end ? parseInt(end.slice(0, 4)) : now.getFullYear());
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const monthLabel = useMemo(() =>
    new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  [viewYear, viewMonth]);

  const yearRange = useMemo(() => {
    const start = Math.floor(viewYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => start + i);
  }, [viewYear]);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: { value: string; day: number; disabled: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      result.push({ value: "", day: 0, disabled: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const val = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({ value: val, day: d, disabled: false });
    }
    return result;
  }, [viewYear, viewMonth]);

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  // Format YYYY-MM-DD to a readable short date
  const fmtShort = (val: string) => {
    const d = new Date(val + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDayClick = (dayValue: string) => {
    // ── Deselect if clicking the same date ──
    if (selecting === "start" && dayValue === start) {
      // Clicking start again: clear the range
      onChange({ start: "", end: "" });
      return;
    }
    if (selecting === "end" && dayValue === end) {
      // Clicking end again: clear just the end, go back to picking end
      onChange({ start, end: start });
      return;
    }
    if (selecting === "end" && dayValue === start) {
      // Clicking start while in end mode: reset selection from this date
      onChange({ start: dayValue, end: dayValue });
      setSelecting("end");
      return;
    }

    // ── Normal two-click selection ──
    if (selecting === "start") {
      const newEnd = dayValue > end ? dayValue : end;
      onChange({ start: dayValue, end: newEnd });
      setSelecting("end");
    } else {
      if (dayValue < start) {
        onChange({ start: dayValue, end: start });
      } else {
        onChange({ start, end: dayValue });
      }
      setSelecting("start");
      setShowCalendar(false);
    }
  };

  const presets = [
    {
      label: "7D",
      get: () => {
        const now = new Date();
        const s = new Date(now);
        s.setDate(s.getDate() - 6);
        return { start: s.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
      },
    },
    {
      label: "30D",
      get: () => {
        const now = new Date();
        const s = new Date(now);
        s.setDate(s.getDate() - 29);
        return { start: s.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
      },
    },
    {
      label: "90D",
      get: () => {
        const now = new Date();
        const s = new Date(now);
        s.setDate(s.getDate() - 89);
        return { start: s.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
      },
    },
    {
      label: "YTD",
      get: () => {
        const now = new Date();
        return { start: `${now.getFullYear()}-01-01`, end: now.toISOString().slice(0, 10) };
      },
    },
  ];

  const isInRange = (val: string) => {
    if (!start || !end || !val) return false;
    return val >= start && val <= end;
  };

  const isStart = (val: string) => val === start;
  const isEnd = (val: string) => val === end;

  const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];

  const displayRange = start && end ? `${fmtShort(start)} — ${fmtShort(end)}` : "Select dates";

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
      >
        <CalendarDays className="size-3.5" />
        <span className="whitespace-nowrap">{displayRange}</span>
      </button>

      {/* Calendar dropdown */}
      {showCalendar && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowCalendar(false)} />
          <div className="absolute left-0 top-full mt-2 z-40 w-[300px] border border-border bg-background shadow-xl">
            {/* Month/Year header */}
            <div className="border-b border-border px-4 py-3">
              {showYearPicker ? (
                /* Year picker grid */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y - 12)}
                      className="flex size-7 items-center justify-center border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                      aria-label="Previous decade"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {yearRange[0]} — {yearRange[11]}
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y + 12)}
                      className="flex size-7 items-center justify-center border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                      aria-label="Next decade"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {yearRange.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setViewYear(y);
                          setShowYearPicker(false);
                        }}
                        className={`py-2 text-center font-mono text-[11px] transition-all ${
                          y === viewYear
                            ? "bg-accent text-accent-foreground font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Month navigation */
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    className="flex size-7 items-center justify-center border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowYearPicker(true)}
                    className="font-display text-sm italic tracking-tight text-foreground hover:text-accent transition-colors cursor-pointer"
                  >
                    {monthLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    className="flex size-7 items-center justify-center border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px px-3 pt-3">
              {dayHeaders.map((d, i) => (
                <div key={i} className="py-1 text-center font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-px px-3 pb-3 pt-1">
              {days.map((d, i) => {
                if (d.disabled) return <div key={`blank-${i}`} />;

                const selected = isInRange(d.value);
                const s = isStart(d.value);
                const e = isEnd(d.value);

                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => handleDayClick(d.value)}
                    className={`relative flex items-center justify-center text-center text-[11px] leading-none transition-all ${
                      selected
                        ? s || e
                          ? "bg-accent text-accent-foreground font-bold z-10"
                          : "bg-accent/15 text-accent font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    } ${s ? "rounded-l-sm" : ""} ${e ? "rounded-r-sm" : ""} ${selected && !s && !e ? "rounded-none" : ""}`}
                    style={{ aspectRatio: "1" }}
                  >
                    {d.day}
                    {(s || e) && (
                      <span className="absolute -top-px left-1/2 -translate-x-1/2 size-1 rounded-full bg-accent-foreground" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Presets */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { onChange(p.get()); setShowCalendar(false); setSelecting("start"); }}
                      className="border border-border/50 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { onChange({ start: "", end: "" }); setShowCalendar(false); setSelecting("start"); }}
                    className="border border-destructive/30 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-destructive/70 hover:border-destructive hover:text-destructive transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                  {selecting === "start" ? "Pick start" : "Pick end"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────── Pagination ──────────────────────────────────────

function PaginationBar({ current, total, pageSize, onChange }: {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {total} total
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          className="flex size-8 items-center justify-center border border-border font-mono text-[10px] text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="px-3 font-mono text-[10px] text-muted-foreground">
          {current} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(current + 1)}
          disabled={current >= totalPages}
          className="flex size-8 items-center justify-center border border-border font-mono text-[10px] text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────── Main Admin Page ────────────────────────────────────────

function AdminPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState("dashboard");

  // ── Data state ──
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Map<string, string[]>>(new Map());
  const [userEmails, setUserEmails] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // Stats
  const [savedCount, setSavedCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [bankCount, setBankCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);

  // Analytics
  const [chartView, setChartView] = useState<"bar" | "line">("line");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 29); // last 30 days
    return {
      start: start.toISOString().slice(0, 10), // YYYY-MM-DD
      end: now.toISOString().slice(0, 10),
    };
  });

  // Image lightbox
  const [lightboxCar, setLightboxCar] = useState<{ image: string; name: string } | null>(null);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxCar(null);
    };
    if (lightboxCar) {
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [lightboxCar]);

  // Inventory
  const [carOverrides, setCarOverrides] = useState<Map<string, CarStatus>>(new Map());
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("all");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // Users
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<{
    saved: SavedCar[];
    orders: OrderRow[];
    bank: BankAcct | null;
  } | null>(null);
  const [loadingExpanded, setLoadingExpanded] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const USERS_PER_PAGE = 15;

  // Photo confirmation track (local — which applications the admin has visually confirmed)
  const [photoConfirmed, setPhotoConfirmed] = useState<Set<string>>(new Set());

  const togglePhotoConfirm = (appId: string) => {
    setPhotoConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  // Dealer Applications
  const [dealerApps, setDealerApps] = useState<DealerApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Rejection reason dialog
  const [rejectingApp, setRejectingApp] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingRejection, setSubmittingRejection] = useState(false);

  // Activity Log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [auditFilterAction, setAuditFilterAction] = useState("all");

  // ── Fetch all data ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [
        profilesRes,
        rolesRes,
        savedRes,
        ordersRes,
        bankRes,
        appsRes,
        auditRes,
        overridesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("saved_cars").select("id", { count: "exact", head: true }),
        supabase.from("order_history").select("*").order("created_at", { ascending: false }),
        supabase.from("bank_accounts").select("id", { count: "exact", head: true }),
        supabase.from("dealer_applications").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100),
        (supabase as any).from("car_status_overrides").select("*"),
      ]);

      setSavedCount(savedRes.count ?? 0);
      setOrderCount(ordersRes.count ?? 0);
      setBankCount(bankRes.count ?? 0);

      // Revenue
      const orders = (ordersRes.data ?? []) as OrderRow[];
      setAllOrders(orders);
      setTotalRevenue(orders.reduce((sum, o) => sum + Number(o.amount), 0));

      // Roles map
      const roleMap = new Map<string, string[]>();
      (rolesRes.data ?? []).forEach((r: UserRole) => {
        roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
      });
      setUserRoles(roleMap);

      // Emails via RPC
      let emailMap = new Map<string, string>();
      try {
        const { data: emailData } = await (supabase.rpc as any)("get_user_emails_for_admin");
        if (emailData) {
          (emailData as UserEmail[]).forEach((e) => emailMap.set(e.user_id, e.email));
          setUserEmails(emailMap);
        }
      } catch (err) {
        console.warn("[Admin] Failed to fetch user emails:", err);
      }

      // Merge profiles + emails
      const profileMap = new Map<string, UserProfile>();
      (profilesRes.data ?? []).forEach((p) => profileMap.set(p.id, p as UserProfile));
      emailMap.forEach((email, userId) => {
        if (!profileMap.has(userId)) {
          profileMap.set(userId, {
            id: userId,
            display_name: email.split("@")[0],
            phone: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
          });
        }
      });
      setProfiles(
        Array.from(profileMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );

      setDealerApps((appsRes.data ?? []) as DealerApplication[]);
      setLoadingApps(false);

      // Audit log
      if (!cancelled) {
        setAuditLog((auditRes.data ?? []) as unknown as AuditEntry[]);
        setLoadingAudit(false);
      }

      // Car overrides
      const overrideMap = new Map<string, CarStatus>();
      const overrideData = (overridesRes.data ?? []) as unknown as CarOverride[];
      overrideData.forEach((o) => overrideMap.set(o.car_id, o.status));
      if (!cancelled) {
        setCarOverrides(overrideMap);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── User detail load ──
  const loadUserDetails = async (userId: string) => {
    setLoadingExpanded(true);
    setExpandedUserId(userId);
    const targetRoles = userRoles.get(userId) ?? [];
    if (targetRoles.includes("admin")) {
      setExpandedData({ saved: [], orders: [], bank: null });
      setLoadingExpanded(false);
      return;
    }
    const [savedRes, ordersRes, bankRes] = await Promise.all([
      supabase.from("saved_cars").select("*").eq("user_id", userId),
      supabase.from("order_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("bank_accounts").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    setExpandedData({
      saved: (savedRes.data ?? []) as SavedCar[],
      orders: (ordersRes.data ?? []) as OrderRow[],
      bank: bankRes.data as BankAcct | null,
    });
    setLoadingExpanded(false);
  };

  // ── Role management ──
  const updateUserRole = async (userId: string, newRole: string) => {
    if (userId === user?.id) { toast.error("You cannot change your own role."); return; }
    const targetRoles = userRoles.get(userId) ?? [];
    if (targetRoles.includes("admin")) { toast.error("Cannot change the role of another admin."); return; }

    const typedRole = newRole as "customer" | "dealer" | "admin";
    const existingRoles = userRoles.get(userId) ?? [];
    if (existingRoles.includes(typedRole)) return;

    const roleArg = typedRole as "customer" | "dealer" | "admin";

    if (typedRole !== "customer") {
      for (const role of existingRoles) {
        if (role !== "customer") {
          await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as "customer" | "dealer" | "admin");
        }
      }
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: roleArg });
      if (error) { toast.error(error.message); return; }
      toast.success(`User promoted to ${typedRole}`);
      if (user) logAdminAction(user.id, "promote_user", "user", userId, { new_role: typedRole });
    } else {
      for (const role of existingRoles) {
        if (role !== "customer") {
          await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as "customer" | "dealer" | "admin");
        }
      }
      toast.success("User demoted to customer");
      if (user) logAdminAction(user.id, "demote_user", "user", userId, { previous_roles: existingRoles });
    }

    const { data: newRoles } = await supabase.from("user_roles").select("user_id, role").eq("user_id", userId);
    if (newRoles) {
      setUserRoles((prev) => {
        const next = new Map(prev);
        next.set(userId, newRoles.map((r) => r.role));
        return next;
      });
    }
  };

  const deleteUserRole = async (userId: string, roleToDelete: string) => {
    if (userId === user?.id) { toast.error("You cannot change your own role."); return; }
    const targetRoles = userRoles.get(userId) ?? [];
    if (targetRoles.includes("admin")) { toast.error("Cannot change the role of another admin."); return; }

    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", roleToDelete as "customer" | "dealer" | "admin");
    if (error) { toast.error(error.message); return; }
    toast.success(`Removed ${roleToDelete} role`);
    if (user) logAdminAction(user.id, "remove_role", "user", userId, { removed_role: roleToDelete });

    setUserRoles((prev) => {
      const next = new Map(prev);
      const roles = (next.get(userId) ?? []).filter((r) => r !== roleToDelete);
      next.set(userId, roles.length ? roles : ["customer"]);
      return next;
    });
  };

  // ── Dealer app actions ──
  const pendingApps = useMemo(() => dealerApps.filter((a) => a.status === "pending"), [dealerApps]);

  const filteredApps = useMemo(() => {
    if (appStatusFilter === "all") return dealerApps;
    return dealerApps.filter((a) => a.status === appStatusFilter);
  }, [dealerApps, appStatusFilter]);

  const handleApprove = async (appId: string, userId: string) => {
    const { error: appErr } = await supabase
      .from("dealer_applications")
      .update({ status: "approved", reviewed_by: user?.id })
      .eq("id", appId);
    if (appErr) { toast.error(appErr.message); return; }

    const { data: existingRoles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    for (const r of (existingRoles ?? [])) {
      if (r.role !== "customer") {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", r.role);
      }
    }
    const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: userId, role: "dealer" });
    if (roleErr) { toast.error(roleErr.message); return; }

    toast.success("Dealer application approved. User promoted to dealer.");
    if (user) logAdminAction(user.id, "approve_dealer", "dealer_application", appId, { user_id: userId });

    setDealerApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: "approved" } : a));
    setUserRoles((prev) => {
      const next = new Map(prev);
      next.set(userId, ["dealer"]);
      return next;
    });
  };

  const handleReject = async (appId: string, reason: string) => {
    const { error } = await supabase
      .from("dealer_applications")
      .update({ status: "rejected", reviewed_by: user?.id, rejection_reason: reason || null })
      .eq("id", appId);
    if (error) { toast.error(error.message); return; }
    toast.success("Application rejected.");
    if (user) logAdminAction(user.id, "reject_dealer", "dealer_application", appId, { reason });
    setDealerApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: "rejected", rejection_reason: reason } : a));
  };

  // ── Car status management ──
  const updateCarStatus = async (carId: string, newStatus: CarStatus) => {
    if (!user) return;
    setSavingStatus(carId);
    try {
      const existing = carOverrides.get(carId);
      if (existing === newStatus) { setSavingStatus(null); return; }

      if (existing) {
        await (supabase as any).from("car_status_overrides").update({ status: newStatus, updated_by: user.id }).eq("car_id", carId);
      } else {
        await (supabase as any).from("car_status_overrides").insert({ car_id: carId, status: newStatus, updated_by: user.id });
      }

      setCarOverrides((prev) => {
        const next = new Map(prev);
        next.set(carId, newStatus);
        return next;
      });

      toast.success(`"${catalog.find((c) => c.id === carId)?.name}" status updated to ${newStatus}`);
      if (user) logAdminAction(user.id, "change_car_status", "car", carId, { new_status: newStatus });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
    setSavingStatus(null);
  };

  const getCarStatus = (carId: string): CarStatus => carOverrides.get(carId) ?? catalog.find((c) => c.id === carId)?.status ?? "AVAILABLE";
  const isCarOverridden = (carId: string) => carOverrides.has(carId);

  // ── Inventory ──
  const filteredInventory = useMemo(() => {
    let items = [...catalog];
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      items = items.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.engine.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    if (inventoryCategory !== "all") {
      items = items.filter((c) => c.category.toLowerCase() === inventoryCategory.toLowerCase());
    }
    if (inventoryStatusFilter !== "all") {
      items = items.filter((c) => getCarStatus(c.id) === inventoryStatusFilter);
    }
    return items;
  }, [catalog, inventorySearch, inventoryCategory, inventoryStatusFilter, carOverrides]);

  const categories = useMemo(() => [...new Set(catalog.map((c) => c.category))], []);
  const statuses: string[] = ["AVAILABLE", "RESERVED", "SOLD"];

  // ── Users ──
  const visibleProfiles = useMemo(() => {
    if (!user) return profiles;
    const others = profiles.filter((p) => p.id !== user.id);
    return others.length > 0 ? others : profiles;
  }, [profiles, user]);

  const filteredUsers = useMemo(() => {
    let list = visibleProfiles;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const email = userEmails.get(p.id) ?? "";
        return (
          (p.display_name ?? "").toLowerCase().includes(q) ||
          email.includes(q) ||
          (p.phone ?? "").includes(q) ||
          p.id.includes(q)
        );
      });
    }
    return list;
  }, [visibleProfiles, searchQuery, userEmails]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "display_name") {
        cmp = (a.display_name ?? "").localeCompare(b.display_name ?? "");
      } else if (sortColumn === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortColumn === "email") {
        cmp = (userEmails.get(a.id) ?? "").localeCompare(userEmails.get(b.id) ?? "");
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [filteredUsers, sortColumn, sortDir, userEmails]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USERS_PER_PAGE;
    return sortedUsers.slice(start, start + USERS_PER_PAGE);
  }, [sortedUsers, userPage]);

  const toggleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
    setUserPage(1);
  };

  const handleExportUsers = () => {
    const data = visibleProfiles.map((p) => ({
      name: p.display_name ?? "Unnamed",
      email: userEmails.get(p.id) ?? "",
      phone: p.phone ?? "",
      joined: fmtDate(p.created_at),
      roles: (userRoles.get(p.id) ?? ["customer"]).join(", "),
      id: p.id,
    }));
    exportToCSV(data, "marque-users", { name: "Name", email: "Email", phone: "Phone", joined: "Joined", roles: "Roles", id: "User ID" });
    if (user) logAdminAction(user.id, "export_csv", "users", undefined, { count: data.length });
    toast.success("Users exported to CSV");
  };

  const handleExportInventory = () => {
    const data = catalog.map((c) => ({
      name: c.name,
      year: c.year,
      price: c.price,
      mileage: c.mileage,
      status: getCarStatus(c.id),
      category: c.category,
      engine: c.engine,
      location: c.location,
    }));
    exportToCSV(data, "marque-inventory", { name: "Name", year: "Year", price: "Price", mileage: "Mileage", status: "Status", category: "Category", engine: "Engine", location: "Location" });
    if (user) logAdminAction(user.id, "export_csv", "inventory", undefined, { count: data.length });
    toast.success("Inventory exported to CSV");
  };

  // ── Audit log ──
  const filteredAudit = useMemo(() => {
    if (auditFilterAction === "all") return auditLog;
    return auditLog.filter((a) => a.action === auditFilterAction);
  }, [auditLog, auditFilterAction]);

  const auditActions = useMemo(() => [...new Set(auditLog.map((a) => a.action))], [auditLog]);

  // ── Revenue ──
  const filteredOrdersByDate = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return allOrders;
    return allOrders.filter((o) => {
      const d = o.created_at.slice(0, 10); // YYYY-MM-DD
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
  }, [allOrders, dateRange]);

  const filteredMonthlyRevenue = useMemo(() => aggregateMonthlyRevenue(filteredOrdersByDate), [filteredOrdersByDate]);
  const totalFilteredRevenue = useMemo(() => filteredOrdersByDate.reduce((s, o) => s + Number(o.amount), 0), [filteredOrdersByDate]);
  const revenueTrend = useMemo(() => {
    if (filteredMonthlyRevenue.length < 2) return null;
    const last = filteredMonthlyRevenue[filteredMonthlyRevenue.length - 1].revenue;
    const prev = filteredMonthlyRevenue[filteredMonthlyRevenue.length - 2].revenue;
    return prev > 0 ? ((last - prev) / prev) * 100 : 0;
  }, [filteredMonthlyRevenue]);

  const carMap = useMemo(() => new Map(catalog.map((c) => [c.id, c])), []);

  // ── Sign out ──
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  // ── Render ──
  return (
    <main className="min-h-screen bg-background md:pl-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">

        {/* ──────────────── HEADER ──────────────── */}
        <div className="animate-reveal flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow text-accent flex items-center gap-2">
              <ShieldCheck className="size-3.5" />
              Admin
            </p>
            <h1 className="mt-4 font-display text-5xl italic uppercase tracking-tighter">
              Control.
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              System overview · {profiles.length} registered users · ${totalRevenue.toLocaleString()} total revenue
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to home
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>

        {/* ──────────────── TABS ──────────────── */}
        <div className="mt-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 flex border-b border-border bg-transparent">
              {[
                { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                { value: "inventory", icon: Package, label: "Inventory" },
                { value: "users", icon: Users, label: "Users" },
                { value: "applications", icon: FileText, label: `Applications${pendingApps.length ? ` (${pendingApps.length})` : ""}` },
                { value: "activity", icon: Activity, label: "Activity" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] transition-all ${
                      isActive
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* ════════════════════════ DASHBOARD TAB ════════════════════════ */}
            <TabsContent value="dashboard" className="mt-0">
              {/* Stats row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} value={loading ? "—" : profiles.length} label="Registered users" accent />
                <StatCard icon={Car} value={catalog.length} label="Car listings" sub={`${catalog.filter((c) => getCarStatus(c.id) === "AVAILABLE").length} available`} />
                <StatCard icon={ShoppingBag} value={orderCount} label="Orders placed" sub={`$${totalRevenue.toLocaleString()} total`} />
                <StatCard icon={Heart} value={savedCount} label="Cars saved" sub={`${bankCount} bank accounts linked`} />
              </div>

              {/* Date Range Filter + Chart Toggle */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <CalendarFilter
                    start={dateRange.start}
                    end={dateRange.end}
                    onChange={(range) => setDateRange(range)}
                  />
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    ${totalFilteredRevenue.toLocaleString()} in period
                  </p>
                </div>
                <div className="flex border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setChartView("line")}
                    className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                      chartView === "line"
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LineChart className="size-3" />
                    Line
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView("bar")}
                    className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                      chartView === "bar"
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BarChart3 className="size-3" />
                    Bar
                  </button>
                </div>
              </div>

              {/* Revenue + pending apps */}
              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                {chartView === "line" ? (
                  <RevenueLineChart data={filteredMonthlyRevenue} />
                ) : (
                  <RevenueChart data={filteredMonthlyRevenue} />
                )}

                <div className="space-y-4">
                  {/* Revenue trend */}
                  <div className="border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="size-4 text-accent" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Revenue Trend</p>
                    </div>
                    {revenueTrend !== null ? (
                      <div>
                        <p className={`font-display text-3xl italic tracking-tight ${revenueTrend >= 0 ? "text-green-500" : "text-destructive"}`}>
                          {revenueTrend >= 0 ? "+" : ""}{revenueTrend.toFixed(1)}%
                        </p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          Month-over-month
                        </p>
                      </div>
                    ) : (
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Insufficient data</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Avg order value</p>
                      <p className="font-display text-xl italic tracking-tight">
                        ${filteredOrdersByDate.length > 0 ? (totalFilteredRevenue / filteredOrdersByDate.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Pending actions */}
                  <div className="border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="size-4 text-yellow-500" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pending actions</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Dealer applications</span>
                        <span className={`font-mono text-[11px] ${pendingApps.length > 0 ? "text-yellow-500 font-bold" : "text-muted-foreground"}`}>
                          {pendingApps.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Bank accounts</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{bankCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Orders</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{orderCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-8 border border-border p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="size-4 text-accent" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Quick Actions</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("inventory")}
                    className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <Package className="size-3.5" />
                    Manage Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("applications")}
                    className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <FileText className="size-3.5" />
                    Review Applications {pendingApps.length > 0 && `(${pendingApps.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportInventory}
                    className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <Download className="size-3.5" />
                    Export Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (user) logAdminAction(user.id, "refresh_dashboard", "system"); toast.success("Dashboard refreshed"); }}
                    className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <RefreshCw className="size-3.5" />
                    Refresh Data
                  </button>
                </div>
              </div>

              {/* Recent activity mini-feed */}
              <div className="mt-6 border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-accent" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Recent Activity</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("activity")}
                    className="font-mono text-[9px] uppercase tracking-widest text-accent hover:text-foreground transition-colors"
                  >
                    View all
                  </button>
                </div>
                {auditLog.length === 0 ? (
                  <p className="py-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {auditLog.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between border-b border-border/30 pb-2 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-1.5 rounded-full bg-accent/60 shrink-0" />
                          <span className="truncate font-mono text-[10px] text-muted-foreground">
                            <span className="text-foreground capitalize">{entry.action.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground/60"> on </span>
                            <span className="text-accent">{entry.entity_type}</span>
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60 ml-4">
                          {fmtDateTime(entry.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ════════════════════════ INVENTORY TAB ════════════════════════ */}
            <TabsContent value="inventory" className="mt-0">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="eyebrow text-accent flex items-center gap-2">
                    <Package className="size-3.5" />
                    Inventory
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {filteredInventory.length} of {catalog.length} listings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportInventory}
                  className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  <Download className="size-3.5" />
                  Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search by name, engine, or location…"
                    className="w-full border border-border bg-transparent py-3 pl-10 pr-4 font-mono text-[11px] uppercase tracking-widest outline-none placeholder:text-neutral-600 focus:border-accent"
                  />
                </div>
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  className="border border-border bg-transparent px-3 py-3 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-accent"
                  aria-label="Filter by category"
                >
                  <option value="all" className="bg-background text-foreground">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()} className="bg-background text-foreground">{cat}</option>
                  ))}
                </select>
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value)}
                  className="border border-border bg-transparent px-3 py-3 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-accent"
                  aria-label="Filter by status"
                >
                  <option value="all" className="bg-background text-foreground">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                  ))}
                </select>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      <th className="px-3 py-3 text-left font-normal">Car</th>
                      <th className="px-3 py-3 text-left font-normal">Year</th>
                      <th className="px-3 py-3 text-left font-normal">Price</th>
                      <th className="px-3 py-3 text-left font-normal">Mileage</th>
                      <th className="px-3 py-3 text-left font-normal">Category</th>
                      <th className="px-3 py-3 text-left font-normal">Status</th>
                      <th className="px-3 py-3 text-right font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="flex flex-col items-center justify-center py-16">
                            <Search className="mb-4 size-8 text-muted-foreground" />
                            <p className="font-display text-xl italic tracking-tight">No cars found.</p>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Try different filters.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((car) => {
                        const effectiveStatus = getCarStatus(car.id);
                        const overridden = isCarOverridden(car.id);
                        return (
                          <tr key={car.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                            <td className="px-3 py-4">
                              <div className="flex items-center gap-3">
                                <div className="group relative size-20 shrink-0 overflow-hidden border border-border/50 bg-neutral-900 cursor-pointer" onClick={() => setLightboxCar({ image: car.image, name: car.name })}>
                                  <img src={car.image} alt={car.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/40">
                                    <Search className="size-5 text-white/0 transition-all duration-200 group-hover:text-white/90" />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold tracking-tight truncate">{car.name}</p>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{car.engine}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 font-mono text-[11px]">{car.year}</td>
                            <td className="px-3 py-4 font-mono text-[11px] font-bold">{fmtPrice(car.price)}</td>
                            <td className="px-3 py-4 font-mono text-[11px] text-muted-foreground">{car.mileage.toLocaleString()} mi</td>
                            <td className="px-3 py-4">
                              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground bg-muted/20 px-2 py-0.5">
                                {car.category}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center gap-1.5">
                                <StatusBadge status={effectiveStatus} />
                                {overridden && (
                                  <span className="text-[8px] font-mono uppercase tracking-widest text-accent" title="Admin override">*</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={effectiveStatus}
                                  onChange={(e) => updateCarStatus(car.id, e.target.value as CarStatus)}
                                  disabled={savingStatus === car.id}
                                  className="border border-border bg-transparent px-2 py-1 font-mono text-[9px] uppercase tracking-widest outline-none focus:border-accent disabled:opacity-50"
                                  aria-label={`Change status for ${car.name}`}
                                >
                                  <option value="AVAILABLE" className="bg-background text-foreground">Available</option>
                                  <option value="RESERVED" className="bg-background text-foreground">Reserved</option>
                                  <option value="SOLD" className="bg-background text-foreground">Sold</option>
                                </select>
                                {savingStatus === car.id && (
                                  <RefreshCw className="size-3 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                  * Asterisk indicates manually overridden status
                </p>
              </div>

              {/* ── Image lightbox ── */}
              {lightboxCar && (
                <>
                  <div
                    className="fixed inset-0 z-50 bg-black/80 animate-in fade-in duration-200"
                    onClick={() => setLightboxCar(null)}
                  />
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    <div className="relative max-h-full max-w-full">
                      <button
                        type="button"
                        onClick={() => setLightboxCar(null)}
                        className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-sm bg-black/60 text-white/80 shadow-lg transition-all hover:bg-black/80 hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                      <img
                        src={lightboxCar.image}
                        alt={lightboxCar.name}
                        className="max-h-[85vh] max-w-[90vw] border border-border/50 bg-neutral-900 object-contain shadow-2xl"
                      />
                      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        {lightboxCar.name}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ════════════════════════ USERS TAB ════════════════════════ */}
            <TabsContent value="users" className="mt-0">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <p className="eyebrow text-accent flex items-center gap-2">
                  <Users className="size-3.5" />
                  User Management
                </p>
                <button
                  type="button"
                  onClick={handleExportUsers}
                  className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  <Download className="size-3.5" />
                  Export CSV
                </button>
              </div>

              {/* Search */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setUserPage(1); }}
                    placeholder="Search by name, email, phone, or ID…"
                    className="w-full border border-border bg-transparent py-3 pl-10 pr-4 font-mono text-[11px] uppercase tracking-widest outline-none placeholder:text-neutral-600 focus:border-accent"
                  />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                  {sortedUsers.length} / {profiles.length}
                </p>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {[
                        { key: "display_name", label: "User" },
                        { key: "email", label: "Contact" },
                        { key: "created_at", label: "Joined" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left font-normal cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => toggleSort(col.key)}
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {sortColumn === col.key && (
                              <span className="text-accent text-[8px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                            )}
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left font-normal">Roles</th>
                      <th className="px-4 py-3 text-right font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex items-center justify-center py-16">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Loading…</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center py-16">
                            <Search className="mb-4 size-8 text-muted-foreground" />
                            <p className="font-display text-xl italic tracking-tight">No users found.</p>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Try a different search term.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((profile) => {
                        const roles = userRoles.get(profile.id) ?? ["customer"];
                        const email = userEmails.get(profile.id) ?? "";
                        const isExpanded = expandedUserId === profile.id;

                        return (
                          <Fragment key={profile.id}>
                            <tr
                              className={`border-b border-border/50 transition-colors ${
                                roles.includes("admin")
                                  ? ""
                                  : isExpanded
                                    ? "bg-surface"
                                    : "cursor-pointer hover:bg-surface/50"
                              }`}
                              onClick={roles.includes("admin") ? undefined : () => isExpanded ? setExpandedUserId(null) : loadUserDetails(profile.id)}
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 items-center justify-center border border-border bg-surface text-[10px] font-mono uppercase text-muted-foreground">
                                    {(profile.display_name ?? "?")[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold tracking-tight">
                                      {profile.display_name || "Unnamed"}
                                    </p>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                      ID: {profile.id.slice(0, 8)}…
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                                  <Mail className="size-3 shrink-0" />
                                  <span className="truncate">{email || "—"}</span>
                                </p>
                                {profile.phone && (
                                  <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                                    <Phone className="size-3 shrink-0" />
                                    {profile.phone}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-4 font-mono text-[10px] text-muted-foreground">
                                {fmtDate(profile.created_at)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {roles.map((role) => (
                                    <span key={role} className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                                      role === "admin"
                                        ? "bg-accent/20 text-accent"
                                        : role === "dealer"
                                          ? "bg-blue-500/20 text-blue-400"
                                          : "bg-muted/20 text-muted-foreground"
                                    }`}>
                                      {role}
                                      {role !== "customer" && role !== "admin" && (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); deleteUserRole(profile.id, role); }}
                                          className="hover:text-destructive transition-colors"
                                        >
                                          <Trash2 className="size-2.5" />
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  {roles.includes("admin") ? (
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-accent px-2 py-1 border border-accent/30">
                                      Admin
                                    </span>
                                  ) : (
                                    <select
                                      value={roles.includes("dealer") ? "dealer" : "customer"}
                                      onChange={(e) => updateUserRole(profile.id, e.target.value)}
                                      className="border border-border bg-transparent px-2 py-1 font-mono text-[9px] uppercase tracking-widest outline-none focus:border-accent"
                                      aria-label="Change role"
                                    >
                                      <option value="customer" className="bg-background text-foreground">Customer</option>
                                      <option value="dealer" className="bg-background text-foreground">Dealer</option>
                                      <option value="admin" className="bg-background text-foreground">Admin</option>
                                    </select>
                                  )}
                                  {!roles.includes("admin") && (
                                    isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Expanded details */}
                            {isExpanded && !roles.includes("admin") && (
                              <tr key={`${profile.id}-details`}>
                                <td colSpan={5} className="border-b border-border bg-surface/50 p-0">
                                  {loadingExpanded ? (
                                    <div className="p-8 text-center">
                                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Loading details…</p>
                                    </div>
                                  ) : expandedData ? (
                                    <div className="grid gap-6 p-6 md:grid-cols-3">
                                      {/* Saved */}
                                      <div className="border border-border bg-background p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                          <Heart className="size-3.5 text-accent" />
                                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Saved ({expandedData.saved.length})</p>
                                        </div>
                                        {expandedData.saved.length === 0 ? (
                                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">No saved cars</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {expandedData.saved.map((s) => (
                                              <div key={s.id} className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0">
                                                <p className="text-xs font-bold tracking-tight">{carMap.get(s.car_id)?.name ?? s.car_id}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Orders */}
                                      <div className="border border-border bg-background p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                          <ShoppingBag className="size-3.5 text-accent" />
                                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Orders ({expandedData.orders.length})</p>
                                        </div>
                                        {expandedData.orders.length === 0 ? (
                                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">No orders</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {expandedData.orders.map((o) => (
                                              <div key={o.id} className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0">
                                                <div>
                                                  <p className="text-xs font-bold tracking-tight">{o.car_name}</p>
                                                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{fmtDate(o.created_at)}</p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-xs font-bold">${o.amount.toLocaleString()}</p>
                                                  <StatusBadge status={o.status} />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Bank */}
                                      <div className="border border-border bg-background p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                          <Landmark className="size-3.5 text-accent" />
                                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Bank Account</p>
                                        </div>
                                        {!expandedData.bank ? (
                                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">No bank account linked</p>
                                        ) : (
                                          <div className="space-y-2">
                                            <div>
                                              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Bank</p>
                                              <p className="text-xs font-bold">{expandedData.bank.bank_name}</p>
                                            </div>
                                            <div>
                                              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Holder</p>
                                              <p className="text-xs font-bold">{expandedData.bank.account_name}</p>
                                            </div>
                                            <div>
                                              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Account</p>
                                              <p className="text-xs font-mono">••••{expandedData.bank.account_number.slice(-4)}</p>
                                            </div>
                                            <div>
                                              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Routing</p>
                                              <p className="text-xs font-mono">{expandedData.bank.routing_number}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : null}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationBar
                current={userPage}
                total={sortedUsers.length}
                pageSize={USERS_PER_PAGE}
                onChange={setUserPage}
              />
            </TabsContent>

            {/* ════════════════════════ APPLICATIONS TAB ════════════════════════ */}
            <TabsContent value="applications" className="mt-0">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <p className="eyebrow text-accent flex items-center gap-2">
                    <Building2 className="size-3.5" />
                    Dealer Applications
                  </p>
                  {pendingApps.length > 0 && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                      {pendingApps.length}
                    </span>
                  )}
                </div>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="border border-border bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-accent"
                  aria-label="Filter applications by status"
                >
                  <option value="all" className="bg-background text-foreground">All</option>
                  <option value="pending" className="bg-background text-foreground">Pending</option>
                  <option value="approved" className="bg-background text-foreground">Approved</option>
                  <option value="rejected" className="bg-background text-foreground">Rejected</option>
                </select>
              </div>

              {loadingApps ? (
                <div className="border border-border p-12 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Loading…</p>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="border border-border p-12 text-center">
                  <Building2 className="mx-auto mb-4 size-8 text-muted-foreground" />
                  <p className="font-display text-xl italic tracking-tight">No applications found.</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {appStatusFilter !== "all" ? "No applications with this status." : "No applications yet."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50 border border-border">
                  {filteredApps.map((app) => (
                    <div key={app.id} className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="truncate text-base font-bold tracking-tight">{app.business_name}</h3>
                            <StatusBadge status={app.status} />
                            {app.resubmitted_at && (
                              <span className="inline-flex items-center gap-1 border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest text-blue-400 shrink-0">
                                <RefreshCw className="size-2" />
                                Re-submitted
                              </span>
                            )}
                          </div>
                          <div className="mt-2 font-mono text-[10px] text-muted-foreground">{app.business_address}</div>
                        </div>
                        <p className="shrink-0 font-mono text-[10px] text-muted-foreground">{fmtDate(app.created_at)}</p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Contact</p>
                          <p className="mt-1 font-mono text-[10px]">{app.phone}</p>
                          {app.website && <p className="mt-0.5 font-mono text-[10px] text-accent">{app.website}</p>}
                        </div>
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Tax ID</p>
                          <p className="mt-1 font-mono text-[10px]">{app.tax_id}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Inventory focus</p>
                        <p className="mt-1 text-sm text-muted-foreground">{app.inventory_focus}</p>
                      </div>

                      {app.message && (
                        <div className="mt-4 border-t border-border/30 pt-4">
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Message</p>
                          <p className="mt-1 text-sm italic text-muted-foreground">"{app.message}"</p>
                        </div>
                      )}

                      {/* Stripe Identity verification status */}
                      {app.verification_status && (
                        <div className="mt-4 border-t border-border/30 pt-4">
                          <div className="flex items-center gap-2">
                            <ScanFace className="size-4 text-accent" />
                            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                              Identity Verification
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest border ${
                                app.verification_status === "verified"
                                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                                  : app.verification_status === "requires_input"
                                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                                    : "border-border/30 bg-muted/20 text-muted-foreground"
                              }`}
                            >
                              {app.verification_status === "verified" && <CheckCircle2 className="size-2.5" />}
                              {app.verification_status === "requires_input" && <Loader2 className="size-2.5" />}
                              {app.verification_status.replace(/_/g, " ")}
                            </span>
                          </div>
                          {app.stripe_verification_session_id && (
                            <p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/50">
                              Session: {app.stripe_verification_session_id.slice(0, 16)}…
                            </p>
                          )}
                        </div>
                      )}

                      {app.id_file_path && (
                        <div className="mt-4 border-t border-border/30 pt-4">
                          <div className="flex items-center gap-2 mb-1">
                            <ScanFace className="size-4 text-accent" />
                            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                              Holding-ID Photo
                            </p>
                            {app.verification_status === "verified" && (
                              <span className="inline-flex items-center gap-1 border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest text-green-500">
                                <CheckCircle2 className="size-2" />
                                Stripe verified
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/50">
                            Confirm the person in the photo matches their ID document and the business details below.
                          </p>
                          <IDViewer filePath={app.id_file_path} />

                          {app.status === "pending" && (
                            <div className="mt-3 flex items-center gap-3 border-t border-border/20 pt-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => togglePhotoConfirm(app.id)}
                                className={`flex items-center gap-2 border px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-all ${
                                  photoConfirmed.has(app.id)
                                    ? "border-green-500/50 bg-green-500/10 text-green-500"
                                    : "border-border/50 text-muted-foreground hover:border-accent hover:text-accent"
                                }`}
                              >
                                {photoConfirmed.has(app.id) ? (
                                  <>
                                    <CheckCircle2 className="size-3.5" />
                                    Photo matches ID
                                  </>
                                ) : (
                                  <>
                                    <span className="size-3.5 rounded-full border-2 border-current" />
                                    Mark as matching
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {app.status === "pending" && (
                        <div className="mt-5 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleApprove(app.id, app.user_id)}
                            className="flex items-center gap-2 border border-green-500/50 bg-green-500/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-green-500 transition-all hover:bg-green-500/20"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => { setRejectingApp(app.id); setRejectionReason(""); }}
                            className="flex items-center gap-2 border border-destructive/50 bg-destructive/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-destructive transition-all hover:bg-destructive/20"
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Rejection reason modal ── */}
            {rejectingApp && (
              <>
                <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setRejectingApp(null)} />
                <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="size-4 text-destructive" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-destructive">
                      Reject application
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Provide a reason for rejection. This will be shown to the applicant.
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Business type not eligible, insufficient documentation…"
                    className="mt-4 w-full resize-y border border-border/50 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-neutral-700 focus:border-accent transition-colors"
                    autoFocus
                  />
                  <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRejectingApp(null)}
                      className="flex items-center gap-2 border border-border/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submittingRejection}
                      onClick={async () => {
                        setSubmittingRejection(true);
                        await handleReject(rejectingApp, rejectionReason);
                        setSubmittingRejection(false);
                        setRejectingApp(null);
                      }}
                      className="flex items-center gap-2 border border-destructive/50 bg-destructive/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-destructive transition-all hover:bg-destructive/20 disabled:opacity-50"
                    >
                      {submittingRejection ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      {submittingRejection ? "Rejecting…" : "Reject with reason"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ════════════════════════ ACTIVITY TAB ════════════════════════ */}
            <TabsContent value="activity" className="mt-0">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <p className="eyebrow text-accent flex items-center gap-2">
                  <Activity className="size-3.5" />
                  Activity Log
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={auditFilterAction}
                    onChange={(e) => setAuditFilterAction(e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-accent"
                    aria-label="Filter by action type"
                  >
                    <option value="all" className="bg-background text-foreground">All Actions</option>
                    {auditActions.map((action) => (
                      <option key={action} value={action} className="bg-background text-foreground">
                        {action.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoadingAudit(true);
                      const { data } = await (supabase as any).from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
                      setAuditLog((data ?? []) as AuditEntry[]);
                      setLoadingAudit(false);
                      toast.success("Activity log refreshed");
                    }}
                    className="flex items-center gap-2 border border-border/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <RefreshCw className="size-3.5" />
                    Refresh
                  </button>
                </div>
              </div>

              {loadingAudit ? (
                <div className="border border-border p-12 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Loading…</p>
                </div>
              ) : filteredAudit.length === 0 ? (
                <div className="border border-border p-12 text-center">
                  <Activity className="mx-auto mb-4 size-8 text-muted-foreground" />
                  <p className="font-display text-xl italic tracking-tight">No activity recorded yet.</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Admin actions will appear here as they happen.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50 border border-border">
                  {filteredAudit.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-4 p-5 hover:bg-surface/30 transition-colors">
                      <div className="flex size-8 shrink-0 items-center justify-center border border-border/50 bg-surface">
                        {entry.action.includes("approve") || entry.action.includes("promote") ? (
                          <CheckCircle2 className="size-3.5 text-green-500" />
                        ) : entry.action.includes("reject") || entry.action.includes("demote") || entry.action.includes("remove") ? (
                          <XCircle className="size-3.5 text-destructive" />
                        ) : (
                          <Activity className="size-3.5 text-accent" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold capitalize tracking-tight">{entry.action.replace(/_/g, " ")}</span>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-accent">{entry.entity_type}</span>
                          {entry.entity_id && (
                            <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                              ID: {entry.entity_id.slice(0, 12)}…
                            </span>
                          )}
                        </div>
                        {entry.details && Object.keys(entry.details).length > 0 && (
                          <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                            {JSON.stringify(entry.details).slice(0, 120)}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {fmtDateTime(entry.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
