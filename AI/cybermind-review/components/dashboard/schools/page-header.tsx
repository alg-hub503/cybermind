import PageTitle from "@/components/ui/page-title";

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
    <PageTitle
      title={title}
      description={description}
      actions={
        <>
          <SearchInput
            defaultValue={search}
          />

          <SortSelect
            defaultValue={sort}
          />
        </>
      }
    />
  );
}