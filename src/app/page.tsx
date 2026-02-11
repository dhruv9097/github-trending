import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import RepoTable from '@/components/RepoTable';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'public', 'data.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = Papa.parse(fileContent, { header: true });

  return (
    <main className="p-10 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-500">GitHub Discovery</h1>
      <RepoTable initialData={data} />
    </main>
  );
}