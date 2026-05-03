import logo from "@/assets/agritrace-logo.jpg";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="AgriTrace" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display text-lg font-semibold">AgriTrace</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">From farm to label — compliant in minutes.</p>
        </div>
        {[
          { title: "Product", links: ["Features", "Pricing", "Changelog"] },
          { title: "Company", links: ["About", "Blog", "Contact"] },
          { title: "Resources", links: ["Docs", "Compliance guide", "Support"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-sm font-semibold">{col.title}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => <li key={l}><a className="hover:text-foreground" href="#">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AgriTrace. Cultivated with care.
      </div>
    </footer>
  );
}
