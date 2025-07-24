import Header from '../components/ui/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      <Header />

      <div className="flex-1 p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 items-center sm:items-start">
          {/* Page content here */}
        </main>
      </div>

      <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-zinc-500 py-10">
        &copy; {new Date().getFullYear()} SwitchFi
      </footer>
    </div>
  );
}
