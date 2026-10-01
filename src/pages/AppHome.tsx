import logo from "@/assets/snaplogo-orange.png";

export default function AppHome() {
  return (
    <div className="min-h-screen bg-muted">
      <header className="flex h-16 items-center gap-2 border-b border-border bg-background px-6">
        <img src={logo} alt="Snaplogo" className="h-7 w-7" />
        <span className="font-heading font-bold text-foreground">Snaplogo App</span>
      </header>
      <main className="mx-auto max-w-[1200px] px-6 py-10" />
    </div>
  );
}
