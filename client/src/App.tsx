import { Dumbbell } from 'lucide-react';

function App(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="flex items-center gap-3 text-slate-800">
        <Dumbbell className="h-8 w-8 text-indigo-600" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Gym Routines</h1>
      </div>
    </main>
  );
}

export default App;
