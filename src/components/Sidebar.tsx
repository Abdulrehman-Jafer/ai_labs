// components/Sidebar.jsx
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-8">AI Labs</h2>
      <nav className="flex flex-col space-y-4">
        <Link href="/ai_search" className="text-lg hover:text-gray-300">
          AI Search
        </Link>
        <Link href="/settings" className="text-lg hover:text-gray-300">
          Settings
        </Link>
      </nav>
    </aside>
  );
}
