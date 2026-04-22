export function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Supabase not configured</h1>
        <p className="text-gray-600 mb-4">
          Add your Supabase project URL and anon key so the app can connect. You’ll get “Failed to fetch” and no events until this is set up.
        </p>
        <ol className="text-left text-sm text-gray-700 space-y-2 list-decimal list-inside mb-6">
          <li>Create a project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-green-600 underline">supabase.com/dashboard</a></li>
          <li>In the project: Settings → API → copy Project URL and anon public key</li>
          <li>In this repo, copy <code className="bg-gray-100 px-1 rounded">app/.env.example</code> to <code className="bg-gray-100 px-1 rounded">app/.env</code></li>
          <li>Set <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-gray-100 px-1 rounded">app/.env</code></li>
          <li>Run the SQL in <code className="bg-gray-100 px-1 rounded">supabase/schema_for_cloud.sql</code> in Supabase SQL Editor</li>
          <li>Restart the dev server</li>
        </ol>
        <p className="text-sm text-gray-500">
          Full steps: see <strong>SUPABASE_SETUP.md</strong> in the project root.
        </p>
      </div>
    </div>
  );
}
