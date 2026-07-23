import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  Heart,
  ShoppingBag,
  Landmark,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Camera,
  ChevronDown,
  Check,
  Bell,
  Mail,
  CalendarDays,
  Activity,
  ChevronRight,
  Smartphone,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { catalog, fmtPrice } from "@/data/cars";

export const Route = createFileRoute("/_authenticated/account")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      if (isAdmin) throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Account — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

type Tab = "profile" | "saved" | "orders" | "bank";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

type SavedCar = { id: string; car_id: string; created_at: string };
type OrderRow = { id: string; car_id: string; car_name: string; amount: number; status: string; created_at: string };
type BankAccount = { id: string; bank_name: string; account_name: string; account_number: string; routing_number: string };type NotifPrefs = { order_updates: boolean; saved_alerts: boolean; promotions: boolean };


const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "saved", label: "Saved", icon: Heart },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "bank", label: "Bank Account", icon: Landmark },
];

const allCountries = [
  // Pinned: popular for this market
  { value: "NZ", label: "New Zealand" },
  { value: "AU", label: "Australia" },
  // Rest: alphabetical
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AG", label: "Antigua & Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia & Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "BN", label: "Brunei" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "CV", label: "Cape Verde" },
  { value: "CF", label: "Central African Republic" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CG", label: "Congo" },
  { value: "CR", label: "Costa Rica" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "TL", label: "East Timor" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "SZ", label: "Eswatini" },
  { value: "ET", label: "Ethiopia" },
  { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GA", label: "Gabon" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GR", label: "Greece" },
  { value: "GD", label: "Grenada" },
  { value: "GT", label: "Guatemala" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KI", label: "Kiribati" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MO", label: "Macau" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "MX", label: "Mexico" },
  { value: "FM", label: "Micronesia" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NC", label: "New Caledonia" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "KP", label: "North Korea" },
  { value: "MK", label: "North Macedonia" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PW", label: "Palau" },
  { value: "PS", label: "Palestine" },
  { value: "PA", label: "Panama" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "QA", label: "Qatar" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" },
  { value: "RW", label: "Rwanda" },
  { value: "KN", label: "Saint Kitts & Nevis" },
  { value: "LC", label: "Saint Lucia" },
  { value: "VC", label: "Saint Vincent & Grenadines" },
  { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" },
  { value: "ST", label: "Sao Tome & Principe" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "KR", label: "South Korea" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TG", label: "Togo" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad & Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TV", label: "Tuvalu" },
  { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" },
  { value: "VA", label: "Vatican City" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
];

function AccountPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [busyBank, setBusyBank] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => {
    try {
      const saved = localStorage.getItem("marque_notif_prefs");
      return saved ? JSON.parse(saved) : { order_updates: true, saved_alerts: true, promotions: false };
    } catch {
      return { order_updates: true, saved_alerts: true, promotions: false };
    }
  });
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState("NZ");
  const [countryFocusIdx, setCountryFocusIdx] = useState(0);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpenUp, setCountryOpenUp] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Show welcome animation on fresh login
  useEffect(() => {
    const shouldWelcome = sessionStorage.getItem("marque_welcome") === "true";
    if (shouldWelcome) {
      sessionStorage.removeItem("marque_welcome");
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 2800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    setCountryValue(profile?.country ?? "NZ");
  }, [profile?.country]);

  useEffect(() => {
    if (!countryOpen) {
      setCountrySearch("");
    } else {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [countryOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Flip country dropdown upward when there isn't enough space below
  useEffect(() => {
    if (!countryOpen) { setCountryOpenUp(false); return; }
    const btn = document.getElementById("country-btn");
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // need ~300px for the dropdown (max-h-48 = 192px + search bar ~50px + gap ~10px + padding)
      setCountryOpenUp(spaceBelow < 300);
    }
  }, [countryOpen]);

  const countries = useMemo(() => {
    if (!countrySearch) return allCountries;
    const q = countrySearch.toLowerCase();
    return allCountries.filter((c) => c.label.toLowerCase().includes(q));
  }, [countrySearch]);

  const isAdmin = roles.includes("admin");

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: r }, { data: s }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("saved_cars").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("order_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p as Profile | null);
      setRoles((r ?? []).map((row: { role: string }) => row.role));
      setSavedCars((s ?? []) as SavedCar[]);
      setOrders((o ?? []) as OrderRow[]);
    })();
  }, [user.id]);

  useEffect(() => {
    if (activeTab === "bank") {
      supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setBankAccount(data as BankAccount | null));
    }
  }, [activeTab, user.id]);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: String(fd.get("display_name") ?? "").trim() || null,
        phone: String(fd.get("phone") ?? "").trim() || null,
        address_line1: String(fd.get("address_line1") ?? "").trim() || null,
        address_line2: String(fd.get("address_line2") ?? "").trim() || null,
        city: String(fd.get("city") ?? "").trim() || null,
        state: String(fd.get("state") ?? "").trim() || null,
        postal_code: String(fd.get("postal_code") ?? "").trim() || null,
        country: String(fd.get("country") ?? "").trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setProfile((prev) => prev ? { ...prev, ...Object.fromEntries(new FormData(e.currentTarget)) } : prev);
    toast.success("Profile updated.");
  };

  const saveBank = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusyBank(true);
    const payload = {
      bank_name: String(fd.get("bank_name") ?? "").trim(),
      account_name: String(fd.get("account_name") ?? "").trim(),
      account_number: String(fd.get("account_number") ?? "").trim(),
      routing_number: String(fd.get("routing_number") ?? "").trim(),
    };
    if (bankAccount) {
      const { error } = await supabase
        .from("bank_accounts")
        .update(payload)
        .eq("user_id", user.id);
      if (error) { setBusyBank(false); toast.error(error.message); return; }
    } else {
      const { error } = await supabase
        .from("bank_accounts")
        .insert({ ...payload, user_id: user.id });
      if (error) { setBusyBank(false); toast.error(error.message); return; }
    }
    setBusyBank(false);
    setBankAccount((prev) => prev ? { ...prev, ...payload } : { id: "", ...payload });
    toast.success("Bank account saved.");
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "31536000", upsert: true });
    if (uploadErr) { toast.error("Failed to upload avatar."); return null; }
    const { data: signedData } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 31536000);
    if (!signedData) { toast.error("Failed to generate avatar URL."); return null; }
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", user.id);
    if (updateErr) { toast.error("Failed to save avatar."); return null; }
    setProfile((prev) => prev ? { ...prev, avatar_url: filePath } : prev);
    return signedData.signedUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    const signedUrl = await uploadAvatar(file);
    if (signedUrl) {
      setAvatarPreview(signedUrl);
      toast.success("Avatar updated.");
    }
  };

  const removeAvatar = async () => {
    if (profile?.avatar_url) {
      await supabase.storage.from("avatars").remove([profile.avatar_url]);
    }
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    setProfile((prev) => prev ? { ...prev, avatar_url: null } : prev);
    setAvatarPreview(null);
    toast.success("Avatar removed.");
  };

  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState<string | null>(null);
  useEffect(() => {
    if (profile?.avatar_url && !avatarPreview) {
      (async () => {
        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profile.avatar_url!, 31536000);
        if (data) setAvatarDisplayUrl(data.signedUrl);
      })();
    }
  }, [profile?.avatar_url]);

  const removeSaved = async (carId: string) => {
    const { error } = await supabase
      .from("saved_cars")
      .delete()
      .eq("user_id", user.id)
      .eq("car_id", carId);
    if (error) { toast.error(error.message); return; }
    setSavedCars((prev) => prev.filter((s) => s.car_id !== carId));
    toast.success("Removed.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const totalSpent = useMemo(() => orders.reduce((s, o) => s + Number(o.amount), 0), [orders]);
  const memberSince = useMemo(() => {
    try { return new Date(user.created_at ?? "").toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
    catch { return "—"; }
  }, [user.created_at]);

  // Persist notification prefs
  useEffect(() => {
    localStorage.setItem("marque_notif_prefs", JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  // Close sign-out dialog on Escape key
  useEffect(() => {
    if (!showSignOutConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSignOutConfirm(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSignOutConfirm]);

  const carMap = new Map(catalog.map((c) => [c.id, c]));

  return (
    <>
      {/* ─── Welcome animation overlay ─── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
          >
            {/* Car silhouette background */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 600 280"
                className="h-auto w-3/4 max-w-xl text-accent/12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Main body */}
                <path
                  d="M80,200 L95,140 Q100,105 130,100 L100,70 Q105,55 125,50 L160,45 L170,30 Q185,20 220,20 L370,20 Q420,20 450,35 L480,45 L520,50 Q555,55 560,80 L580,90 Q600,100 600,130 L600,155 Q600,170 585,175 L575,180 Q560,190 530,190 L470,190 Q440,190 425,180 L165,180 Q150,190 120,190 L85,190 Q65,190 65,175 L60,170 Q55,165 55,155 L55,140 Q50,145 45,155 L40,170 Q35,190 50,200 Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-accent/20"
                />
                {/* Roof / cabin */}
                <path
                  d="M140,100 L170,50 L220,45 L370,45 L450,55 L500,65 L540,80"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-accent/20"
                />
                {/* Rear window */}
                <path
                  d="M165,95 L185,55 L225,50 L260,50 L280,60 L280,95 Z"
                  fill="currentColor"
                  className="text-accent/8"
                />
                {/* Side window */}
                <path
                  d="M290,60 L290,95 L420,95 L420,55 L350,50 Z"
                  fill="currentColor"
                  className="text-accent/8"
                />
                {/* Front window */}
                <path
                  d="M430,55 L435,95 L495,85 L510,65 L480,50 Z"
                  fill="currentColor"
                  className="text-accent/8"
                />
                {/* Rear wheel */}
                <circle
                  cx="205"
                  cy="195"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent/25"
                />
                <circle
                  cx="205"
                  cy="195"
                  r="14"
                  fill="currentColor"
                  className="text-accent/15"
                />
                {/* Front wheel */}
                <circle
                  cx="460"
                  cy="195"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent/25"
                />
                <circle
                  cx="460"
                  cy="195"
                  r="14"
                  fill="currentColor"
                  className="text-accent/15"
                />
              </svg>
            </motion.div>

            {/* Floating particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: `${30 + Math.sin(i * 1.7) * 40}%`,
                  y: `${80 + Math.random() * 20}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0.25, 0],
                  y: [`${80 + Math.random() * 20}%`, `${10 - Math.random() * 20}%`],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 4)],
                }}
                transition={{
                  duration: 3 + (i % 3) * 1.5,
                  delay: 0.5 + (i % 4) * 0.3,
                  ease: "easeOut",
                  repeat: 0,
                }}
                className="absolute size-1 rounded-full bg-accent/40"
                aria-hidden="true"
              />
            ))}

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="eyebrow text-accent"
              >
                Welcome back
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -30 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                className="mt-5 font-display text-7xl italic uppercase leading-none tracking-tighter sm:text-8xl"
              >
                {profile?.display_name || user.email?.split("@")[0] || "Driver"}
                <span className="text-accent">.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-6 font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground"
              >
                The garage is open
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    <main className="min-h-screen bg-background md:pl-16">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          {/* HEADER */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-6">
              {/* Avatar in header */}
              <div className="group relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-surface cursor-pointer">
                {(avatarPreview || avatarDisplayUrl) ? (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center">
                    <img
                      src={avatarPreview || avatarDisplayUrl || ""}
                      alt=""
                      className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
                      <Camera className="size-5 text-white opacity-0 transition-all duration-200 group-hover:opacity-100" />
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center transition-colors duration-200 hover:bg-neutral-800">
                    <Camera className="size-5 text-muted-foreground/30 transition-colors duration-200 group-hover:text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
                {(profile?.avatar_url || avatarPreview) && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.3em] text-white/70 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-destructive"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div>
                <p className="eyebrow text-accent">Account</p>
                <h1 className="mt-4 font-display text-5xl italic uppercase tracking-tighter">
                  {profile?.display_name ?? "Driver"}.
                </h1>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  {user.email} · {roles.join(" · ") || "customer"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={signOut}
              className="rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em] px-8 border-border bg-transparent gap-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>

          {/* ─── STATS STRIP ─────────────────────── */}
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border/60 sm:grid-cols-4">
            <div className="bg-background p-5">
              <p className="font-display text-3xl italic tracking-tight">
                {orders.length > 0 ? fmtPrice(totalSpent) : "—"}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <ShoppingBag className="size-3" />
                Total spent
              </p>
            </div>
            <div className="bg-background p-5">
              <p className="font-display text-3xl italic tracking-tight">{orders.length}</p>
              <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <Activity className="size-3" />
                Orders
              </p>
            </div>
            <div className="bg-background p-5">
              <p className="font-display text-3xl italic tracking-tight">{savedCars.length}</p>
              <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <Heart className="size-3" />
                Saved
              </p>
            </div>
            <div className="bg-background p-5">
              <p className="font-display text-3xl italic tracking-tight">{memberSince}</p>
              <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <CalendarDays className="size-3" />
                Member since
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-10 flex flex-wrap gap-1 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-200 ${
                    activeTab === tab.key
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="mt-8">
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* ─── Dealer CTA ───────────────────── */}
                {!roles.includes("dealer") && !isAdmin && (
                  <div className="border border-border/50 bg-surface p-6 md:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display text-xl italic uppercase tracking-tight">
                          Own a business? Become a dealer.
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          Trade pricing, priority access, and dedicated support on every order.
                        </p>
                      </div>
                      <Link
                        to="/apply"
                        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-foreground px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-background transition-all hover:bg-accent hover:text-accent-foreground"
                      >
                        Apply now
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                )}


                {/* ─── Profile form ─────────────────── */}
                <form onSubmit={saveProfile} className="space-y-6">
                  {/* ── Personal details ── */}
                  <div>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      <User className="size-3.5" />
                      Personal details
                    </p>
                    <div className="divide-y divide-border/50 border border-border/50 bg-surface">
                      <div className="px-6 py-4">
                        <Label htmlFor="display_name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          Display name
                        </Label>
                        <Input
                          id="display_name"
                          name="display_name"
                          defaultValue={profile?.display_name ?? ""}
                          className="mt-2 rounded-none border-border bg-transparent h-12"
                        />
                      </div>
                      <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="phone" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={profile?.phone ?? ""}
                            className="mt-2 rounded-none border-border bg-transparent h-12"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="email-display" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                              Email
                            </Label>
                            <span className="rounded-sm border border-border/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/50">
                              READ-ONLY
                            </span>
                          </div>
                          <Input
                            id="email-display"
                            value={user.email ?? ""}
                            disabled
                            className="mt-2 rounded-none border-border bg-transparent h-12 opacity-60"
                          />
                          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                            Managed via Supabase Auth
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Notification Preferences ── */}
                  <div>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      <Bell className="size-3.5" />
                      Notification preferences
                    </p>
                    <div className="divide-y divide-border/50 border border-border/50 bg-surface">
                      {([
                        { key: "order_updates" as const, label: "Order updates", desc: "Shipping confirmations, delivery status, and receipts", icon: ShoppingBag },
                        { key: "saved_alerts" as const, label: "Saved car alerts", desc: "Price changes and availability updates on saved vehicles", icon: Heart },
                        { key: "promotions" as const, label: "Promotions & offers", desc: "New arrivals, exclusive events, and special offers", icon: Mail },
                      ] as const).map((item) => {
                        const Icon = item.icon;
                        const isOn = notifPrefs[item.key];
                        return (
                          <div key={item.key} className="flex items-center justify-between gap-4 px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-bold tracking-tight">{item.label}</p>
                                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isOn}
                              onClick={() => setNotifPrefs((prev: NotifPrefs) => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus:outline-none ${
                                isOn
                                  ? "border-accent bg-accent/20"
                                  : "border-border bg-transparent"
                              }`}
                            >
                              <span
                                className={`inline-block size-4 rounded-full border transition-transform duration-200 ${
                                  isOn
                                    ? "translate-x-[22px] border-accent bg-accent"
                                    : "translate-x-[3px] border-muted-foreground bg-muted-foreground"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Account Security ── */}
                  <div>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      <ShieldCheck className="size-3.5" />
                      Account security
                    </p>
                    <div className="divide-y divide-border/50 border border-border/50 bg-surface">
                      <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold tracking-tight">Password</p>
                          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                            Last changed — manage your login credentials
                          </p>
                        </div>
                        <Link
                          to="/forgot-password"
                          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-border px-5 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-accent hover:text-accent"
                        >
                          Change password
                          <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-4 px-6 py-4">
                        <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold tracking-tight">Active sessions</p>
                          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                            You are logged in on this device ·{" "}
                            <button
                              type="button"
                              onClick={() => setShowSignOutConfirm(true)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              Sign out this device
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Address ── */}
                  <div>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      <Landmark className="size-3.5" />
                      Address
                    </p>
                    <div className="divide-y divide-border/50 border border-border/50 bg-surface">
                      <div className="px-6 py-4">
                        <Label htmlFor="address_line1" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          Street address
                        </Label>
                        <Input
                          id="address_line1"
                          name="address_line1"
                          defaultValue={profile?.address_line1 ?? ""}
                          className="mt-2 rounded-none border-border bg-transparent h-12"
                        />
                      </div>
                      <div className="px-6 py-4">
                        <Label htmlFor="address_line2" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          Apt / Suite (optional)
                        </Label>
                        <Input
                          id="address_line2"
                          name="address_line2"
                          defaultValue={profile?.address_line2 ?? ""}
                          className="mt-2 rounded-none border-border bg-transparent h-12"
                        />
                      </div>
                      <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="city" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            City
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            defaultValue={profile?.city ?? ""}
                            className="mt-2 rounded-none border-border bg-transparent h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            State
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            defaultValue={profile?.state ?? ""}
                            className="mt-2 rounded-none border-border bg-transparent h-12"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="postal_code" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            Postal code
                          </Label>
                          <Input
                            id="postal_code"
                            name="postal_code"
                            defaultValue={profile?.postal_code ?? ""}
                            className="mt-2 rounded-none border-border bg-transparent h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country-btn" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            Country
                          </Label>
                          <div className="relative mt-2" ref={countryRef}>
                            <input type="hidden" name="country" value={countryValue} />
                            <button
                              id="country-btn"
                              type="button"
                              aria-haspopup="listbox"
                              aria-expanded={countryOpen}
                              onClick={() => setCountryOpen(!countryOpen)}
                              onKeyDown={(e) => {
                                if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !countryOpen) {
                                  e.preventDefault();
                                  setCountryOpen(true);
                                  setCountryFocusIdx(0);
                                }
                                if (e.key === "Enter" && !countryOpen) {
                                  e.preventDefault();
                                  setCountryOpen(true);
                                }
                              }}
                              className="flex w-full items-center justify-between rounded-none border border-border bg-transparent px-4 h-12 font-mono text-sm text-foreground outline-none focus:border-accent transition-colors"
                            >
                              <span>{allCountries.find((c) => c.value === countryValue)?.label ?? "Select country"}</span>
                              <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${countryOpen ? "rotate-180" : ""}`} />
                            </button>
                            {countryOpen && (
                              <div className={`absolute left-0 right-0 z-50 ${countryOpenUp ? "bottom-full mb-1" : "top-full mt-1"} border border-border bg-[#1a1a1a] shadow-lg`}>
                                {/* Search input */}
                                <div className="border-b border-border/50 px-3 py-2.5">
                                  <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={countrySearch}
                                    onChange={(e) => {
                                      setCountrySearch(e.target.value);
                                      setCountryFocusIdx(0);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setCountryFocusIdx((prev) => {
                                          const next = Math.min(prev + 1, countries.length - 1);
                                          setTimeout(() => document.getElementById(`country-opt-${countries[next].value}`)?.scrollIntoView?.({ block: "nearest" }), 0);
                                          return next;
                                        });
                                      }
                                      if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setCountryFocusIdx((prev) => {
                                          const next = Math.max(prev - 1, 0);
                                          setTimeout(() => document.getElementById(`country-opt-${countries[next].value}`)?.scrollIntoView?.({ block: "nearest" }), 0);
                                          return next;
                                        });
                                      }
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (countries.length > 0) {
                                          setCountryValue(countries[Math.min(countryFocusIdx, countries.length - 1)].value);
                                          setCountryOpen(false);
                                        }
                                      }
                                      if (e.key === "Escape") {
                                        setCountryOpen(false);
                                      }
                                    }}
                                    placeholder="Search countries..."
                                    className="w-full bg-transparent px-2 py-1 font-mono text-sm text-[#e5e5e5] outline-none placeholder:text-neutral-600"
                                  />
                                </div>
                                {/* Options list */}
                                <div
                                  role="listbox"
                                  aria-label="Country"
                                  className="max-h-48 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#404040_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent"
                                >
                                  {countries.length === 0 ? (
                                    <div className="px-4 py-6 text-center font-mono text-xs text-neutral-600">
                                      No countries found
                                    </div>
                                  ) : (
                                    countries.map((c, i) => {
                                      const isSelected = c.value === countryValue;
                                      const isFocused = i === countryFocusIdx;
                                      return (
                                        <button
                                          key={c.value}
                                          id={`country-opt-${c.value}`}
                                          role="option"
                                          aria-selected={isSelected}
                                          type="button"
                                          onClick={() => {
                                            setCountryValue(c.value);
                                            setCountryOpen(false);
                                          }}
                                          onMouseEnter={() => setCountryFocusIdx(i)}
                                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-mono text-sm transition-colors ${
                                            isSelected
                                              ? "text-accent"
                                              : isFocused
                                              ? "text-[#e5e5e5] bg-[#2a2a2a]"
                                              : "text-[#e5e5e5]"
                                          }`}
                                        >
                                          <span className="w-4 shrink-0">
                                            {isSelected && <Check className="size-3.5 text-accent" />}
                                          </span>
                                          <span>{c.label}</span>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em] px-8"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </form>

                {/* ─── Role links ──────────────────── */}
                {roles.includes("dealer") && (
                  <div className="border-t border-border pt-8">
                    <Link
                      to="/dealer"
                      className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-blue-400 hover:text-foreground transition-colors"
                    >
                      <Building2 className="size-4" />
                      Dealer dashboard
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Manage your listings, profile, and payouts
                    </p>
                  </div>
                )}

                {isAdmin && (
                  <div className="border-t border-border pt-8">
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-accent hover:text-foreground transition-colors"
                    >
                      <ShieldCheck className="size-4" />
                      Admin dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {savedCars.length} saved vehicle{savedCars.length !== 1 ? "s" : ""}
                </p>
                {savedCars.length === 0 ? (
                  <div className="border border-border p-16 text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-border/50 bg-surface">
                      <Heart className="size-7 text-muted-foreground" />
                    </div>
                    <p className="font-display text-2xl italic tracking-tight">Nothing saved yet.</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground max-w-xs mx-auto">
                      Browse our curated inventory and tap the heart icon to save your favorite vehicles.
                    </p>
                    <Link
                      to="/cars"
                      className="mt-8 inline-flex h-12 items-center justify-center gap-2 bg-foreground px-8 font-mono text-[10px] uppercase tracking-[0.3em] text-background transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      Browse inventory
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {savedCars.map((saved) => {
                      const car = carMap.get(saved.car_id);
                      if (!car) return null;
                      return (
                        <div key={saved.id} className="group relative overflow-hidden border border-border bg-background">
                          <div className="aspect-[4/3] overflow-hidden bg-neutral-900">
                            <img
                              src={car.image}
                              alt={car.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="truncate text-sm font-bold tracking-tight">{car.name}</h3>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              {car.year} · {car.hp} HP
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm font-bold">{fmtPrice(car.price)}</span>
                              <button
                                type="button"
                                onClick={() => removeSaved(saved.car_id)}
                                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </p>
                {orders.length === 0 ? (
                  <div className="border border-border p-16 text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-border/50 bg-surface">
                      <ShoppingBag className="size-7 text-muted-foreground" />
                    </div>
                    <p className="font-display text-2xl italic tracking-tight">No orders yet.</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Your purchase history will appear here once you place your first order.
                    </p>
                    <Link
                      to="/cars"
                      className="mt-8 inline-flex h-12 items-center justify-center gap-2 bg-foreground px-8 font-mono text-[10px] uppercase tracking-[0.3em] text-background transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      Browse inventory
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50 border border-border">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const car = carMap.get(order.car_id);
                      return (
                        <div key={order.id}>
                          {/* ── Order row header (always visible) ── */}
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface/50"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              {car && (
                                <div className="size-12 shrink-0 overflow-hidden bg-neutral-900">
                                  <img
                                    src={car.image}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold tracking-tight">{order.car_name}</p>
                                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-sm font-bold">{fmtPrice(order.amount)}</span>
                                <p className="mt-0.5">
                                  <span
                                    className={`font-mono text-[9px] uppercase tracking-widest ${
                                      order.status === "completed"
                                        ? "text-green-500"
                                        : order.status === "cancelled"
                                          ? "text-destructive"
                                          : "text-yellow-500"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </p>
                              </div>
                              <ChevronRight
                                className={`size-4 text-muted-foreground transition-transform duration-200 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {/* ── Expanded detail ── */}
                          {isExpanded && (
                            <div className="border-t border-border/30 bg-surface/30 px-5 pb-5 pt-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                    Order ID
                                  </p>
                                  <p className="mt-1 font-mono text-[11px] text-foreground/80">
                                    {order.id.slice(0, 8)}…
                                  </p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                    Amount
                                  </p>
                                  <p className="mt-1 font-mono text-[11px] text-foreground/80">
                                    {fmtPrice(order.amount)}
                                  </p>
                                </div>
                              </div>

                              {/* ── Timeline ── */}
                              <div className="mt-5">
                                <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                  Timeline
                                </p>
                                <div className="space-y-0">
                                  {[
                                    { label: "Order placed", date: new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), done: true },
                                    { label: "Processing", date: null as string | null, done: order.status !== "pending" },
                                    { label: "Shipped", date: null as string | null, done: order.status === "completed" },
                                    { label: "Delivered", date: null as string | null, done: order.status === "completed" },
                                  ].map((step, i) => (
                                    <div key={step.label} className="flex items-start gap-3">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={`size-2.5 rounded-full border-2 ${
                                            step.done
                                              ? step.label === "Delivered"
                                                ? "border-green-500 bg-green-500"
                                                : "border-accent bg-accent"
                                              : "border-muted-foreground/30 bg-transparent"
                                          }`}
                                        />
                                        {i < 3 && (
                                          <div
                                            className={`mt-0 h-5 w-px ${
                                              step.done ? "bg-accent/40" : "bg-border"
                                            }`}
                                          />
                                        )}
                                      </div>
                                      <div className="pb-5">
                                        <p
                                          className={`font-mono text-[11px] tracking-tight ${
                                            step.done ? "text-foreground" : "text-muted-foreground/50"
                                          }`}
                                        >
                                          {step.label}
                                        </p>
                                        {step.date && (
                                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                            {step.date}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── Sign out confirmation dialog ─── */}
            <AnimatePresence>
              {showSignOutConfirm && (
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                  onClick={() => setShowSignOutConfirm(false)}
                />
              )}
              {showSignOutConfirm && (
                <div key="panel-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    key="panel"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-sm border border-border bg-background shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-destructive/80" />
                    <div className="p-8">
                    <motion.div
                      initial={{ boxShadow: "0 0 0px rgba(239, 68, 68, 0)" }}
                      animate={{ boxShadow: "0 0 24px rgba(239, 68, 68, 0.35)" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="mx-auto flex size-14 items-center justify-center border-2 border-destructive/30 bg-destructive/10"
                    >
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 14, stiffness: 220, delay: 0.1 }}
                      >
                        <LogOut className="size-6 text-destructive" />
                      </motion.div>
                    </motion.div>
                    <h2 className="mt-6 text-center font-display text-4xl italic uppercase leading-none tracking-tighter">
                      Sign out?
                    </h2>
                    <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
                      You&apos;ll be signed out of this device and returned to the
                      sign-in page. You can sign back in anytime.
                    </p>
                    <div className="mt-8 flex items-center gap-3">
                      <button
                        type="button"
                        autoFocus
                        onClick={() => setShowSignOutConfirm(false)}
                        className="flex h-12 flex-1 items-center justify-center border border-border bg-transparent font-mono text-[10px] uppercase tracking-[0.3em] text-foreground transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:text-accent"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmSignOut}
                        className="flex h-12 flex-1 items-center justify-center bg-destructive font-mono text-[10px] uppercase tracking-[0.3em] text-destructive-foreground transition-all duration-200 hover:bg-destructive/90 active:scale-[0.97]"
                      >
                        Sign out
                      </button>
                    </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {activeTab === "bank" && (
              <form onSubmit={saveBank} className="max-w-lg space-y-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {bankAccount ? "Update your bank details" : "Link a bank account"}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="account_name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Account holder name
                  </Label>
                  <Input
                    id="account_name"
                    name="account_name"
                    defaultValue={bankAccount?.account_name ?? ""}
                    required
                    className="rounded-none border-border bg-transparent h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Bank name
                  </Label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                    defaultValue={bankAccount?.bank_name ?? ""}
                    required
                    className="rounded-none border-border bg-transparent h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Account number
                  </Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    defaultValue={bankAccount?.account_number ?? ""}
                    required
                    className="rounded-none border-border bg-transparent h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routing_number" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Routing number
                  </Label>
                  <Input
                    id="routing_number"
                    name="routing_number"
                    defaultValue={bankAccount?.routing_number ?? ""}
                    required
                    className="rounded-none border-border bg-transparent h-12"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={busyBank}
                    className="rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em] px-8"
                  >
                    {busyBank ? "Saving…" : bankAccount ? "Update bank" : "Save bank"}
                  </Button>
                  {bankAccount && (
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-green-500">
                      <span className="size-1.5 rounded-full bg-green-500" />
                      Linked
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      </>
  );
}
