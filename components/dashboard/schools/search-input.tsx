"use client";

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchInput({
  defaultValue = "",
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <form
      method="GET"
      className="w-full md:w-96"
    >
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-600"
      />
    </form>
  );
}