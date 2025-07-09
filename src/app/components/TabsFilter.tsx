"use client";
import { TabGroup, Tab } from "@headlessui/react";
import { useRouter, useSearchParams } from "next/navigation";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
const languages = ["JavaScript", "Python", "Java", "C#", "Ruby", "Go", "PHP", "TypeScript", "C++", "Swift", "Kotlin", "Rust", "Dart", "Scala", "Shell", "HTML", "CSS"];

export default function TabsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = ["All", "Language", "Tags"];
  const currentTab = searchParams.get("tab") || "All";
  const currentLanguage = searchParams.get("language") || "";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    if (tab !== "Language") {
      params.delete("language");
    }
    router.push(`?${params.toString()}`);
  };

  const handleLanguageChange = (language: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("language", language);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      <TabGroup
        selectedIndex={tabs.findIndex((tab) => tab === currentTab)}
        onChange={(index) => handleTabChange(tabs[index])}
      >
        <Tab.List className="flex space-x-2 border-b pb-2 mb-4">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  "px-4 py-2 font-medium text-sm",
                  selected
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-neutral-600 hover:text-blue-600"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
      </TabGroup>
      {currentTab === "Language" && (
        <div className="flex flex-wrap space-x-2 border-b pb-2">
            {languages.map((language) => (
                <button
                key={language}
                onClick={() => handleLanguageChange(language)}className={classNames(
                    "px-3 py-1 rounded",
                    currentLanguage === language
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-blue-50"
                )}>{language}</button>
            ))}
        </div>
      )}
    </div>
  );
}
