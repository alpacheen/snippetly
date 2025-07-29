"use client";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";

type TabsFilterProps = {
  tags: string[];
};

const languages = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "Ruby",
  "Go",
  "PHP",
  "TypeScript",
  "C++",
  "Swift",
  "Kotlin",
  "Rust",
  "Dart",
  "Scala",
  "Shell",
  "HTML",
  "CSS",
];

export default function TabsFilter({ tags }: TabsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = ["All", "Language", "Tags"];
  const currentTab = searchParams.get("tab") || "All";
  const currentLanguage = searchParams.get("language") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(currentQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        router.push(`?${params.toString()}`);
    },400);
    return () => clearTimeout(timeout);
  },[searchQuery, searchParams, router]);

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    if (tab !== "Language") params.delete("language");
    if (tab !== "Tags") {
      params.delete("tag");
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleLanguageChange = (language: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("language", language);
    router.push(`?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tag", tag);
    router.push(`?${params.toString()}`);
  }


  return (
    <div className="mb-6">
        <input type="text"
        placeholder="Search snippets..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border px-4 py-2 rounded"/>
      <TabGroup 
      selectedIndex={tabs.indexOf(currentTab)}
      onChange={(index) => handleTabChange(tabs[index])}>
        <TabList className="flex space-x-2 border-b pb-2 mb-4">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                clsx(
                  "px-4 py-2 font-medium text-sm cursor-pointer",
                  selected
                    ? "border-b-2 border-darkGreen text-amber-300"
                    : "text-textSecondary hover:text-darkGreen/90"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>
      </TabGroup>
      {currentTab === "Language" && (
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => handleLanguageChange(language)}
              className={clsx(
                "px-3 py-1 rounded cursor-pointer",
                currentLanguage === language
                  ? "bg-lightGreen text-primary cursor-pointer"
                  : "bg-text text-primary hover:bg-blue-50 cursor-pointer"
              )}
            >
              {language}
            </button>
          ))}
        </div>
      )}
      {currentTab === "Tags" && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagChange(tag)}
              className={clsx(
                "px-3 py-1 rounded text-sm cursor-pointer",
                currentTag === tag
                  ? "bg-lightGreen text-primary cursor-pointer"
                  : "bg-text text-primary hover:bg-blue-50 cursor-pointer"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        )}
    </div>
  );
}
