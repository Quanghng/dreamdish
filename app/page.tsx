export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <main className="flex flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-6xl font-bold text-amber-900">
          🍽️ DreamDish
        </h1>
        <p className="text-2xl text-amber-700 font-light">
          Hello World
        </p>
        <p className="text-center text-amber-600 max-w-md">
          Transformez vos ingrédients en œuvre d'art culinaire grâce à l'IA
        </p>
      </main>
    </div>
  );
}
