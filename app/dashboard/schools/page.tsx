import { getSchools } from "@/lib/features/schools/school-actions";
import { School } from "@/lib/features/schools/types/school";

export default async function SchoolsPage() {
  const schools = await getSchools();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Schools</h1>

      <div className="rounded-lg border bg-white">
        {schools.map((school: School) => (
          <div key={school.id} className="border-b p-3">
            {school.name}
          </div>
        ))}
      </div>
    </main>
  );
}
