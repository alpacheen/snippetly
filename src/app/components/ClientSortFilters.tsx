"use client";

import { useRouter } from "next/navigation";

interface ClientSortFiltersProps {
  currentSort: string;
  searchParams: Record<string, string | number>;
}

export default function ClientSortFilters({
  currentSort,
  searchParams,
}: ClientSortFiltersProps) {
  const router = useRouter();

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "popular", label: "Popular" },
  ];

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams();

    // Preserve existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "sort" && value) {
        params.set(key, value.toString());
      }
    });

    // Set new sort
    params.set("sort", newSort);

    router.push(`/snippets?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-textSecondary">Sort by:</span>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSortChange(option.value)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            currentSort === option.value
              ? "bg-lightGreen text-primary"
              : "bg-textSecondary/10 text-textSecondary hover:bg-textSecondary/20"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
