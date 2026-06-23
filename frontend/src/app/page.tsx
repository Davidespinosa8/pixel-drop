export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen gap-4 px-4">
      <h1
        className="text-2xl sm:text-4xl font-mono font-bold tracking-widest uppercase text-arcade-cyan"
        style={{ textShadow: "0 0 12px rgba(69,243,255,0.4)" }}
      >
        PIXEL DROP
      </h1>
      <p className="text-sm sm:text-base font-mono tracking-widest text-text-muted">
        SISTEMA EN INICIALIZACIÓN
      </p>
    </main>
  );
}
