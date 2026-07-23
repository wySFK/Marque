import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="flex flex-col gap-6 border-t border-border p-8 md:flex-row md:items-center md:justify-between md:p-12">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        © {new Date().getFullYear()} Marque Ltd.
      </div>
      <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">
          Terms
        </Link>
        <Link to="/sell" className="hover:text-foreground transition-colors">
          Consignment
        </Link>
        <Link to="/contact" className="hover:text-foreground transition-colors">
          Contact
        </Link>
      </div>
    </footer>
  );
}
