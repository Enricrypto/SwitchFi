import Header from '../components/ui/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120023] via-[#1B002B] to-[#2B003D] text-white font-sans">
      {' '}
      <Header />
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 items-center sm:items-start"></main>
        <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-zinc-500 mt-12">
          &copy; {new Date().getFullYear()} SwitchFi
        </footer>
      </div>
    </div>
  );
}
