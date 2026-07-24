import SearchInput from "./search-input";
import SortSelect from "./sort-select";

interface Props {
  title: string;
  description: string;
  search?: string;
  sort?: string;
}

export default function PageHeader({
  title,
  description,
  search,
  sort,
}: Props) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <p className="mt-2 text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex gap-3">
        <SearchInput defaultValue={search} />
        <SortSelect defaultValue={sort} />
      </div>
    </div>
  );
}