import { supabase } from "@/integrations/supabase/client";

/**
 * Export an array of objects as a CSV file download.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columnMap?: Record<string, string>,
) {
  if (!data.length) return;

  const keys = Object.keys(data[0]);
  const headers = keys.map((k) => (columnMap?.[k] ?? k));
  const rows = data.map((row) =>
    keys.map((k) => {
      const val = row[k];
      if (val === null || val === undefined) return "";
      const str = String(val);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }),
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Log an admin action to the audit log table.
 * Gracefully fails if the table doesn't exist yet.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
) {
  try {
    await (supabase as any).from("admin_audit_log").insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? null,
    });
  } catch (err) {
    console.warn("[AdminAudit] Failed to log action:", err);
  }
}

/**
 * Format a date for display.
 */
export function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date with time.
 */
export function fmtDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Aggregate order history into monthly revenue data.
 */
export function aggregateMonthlyRevenue(
  orders: { amount: number; created_at: string }[],
): { month: string; revenue: number; count: number }[] {
  const monthlyMap = new Map<string, { revenue: number; count: number }>();

  for (const order of orders) {
    const d = new Date(order.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthlyMap.get(key) ?? { revenue: 0, count: 0 };
    existing.revenue += Number(order.amount);
    existing.count += 1;
    monthlyMap.set(key, existing);
  }

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
