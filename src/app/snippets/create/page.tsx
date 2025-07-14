import SnippetCreationForm from "@/app/components/SnippetCreationForm";

export const metadata = {
    title: "Create New Snippet | Snippetly",
  description: "Create and share a new code snippet with the developer community.",
}

export default function CreateSnippetPage() {
    return (
        <div className="max-w-4xl mx-auto">
          <SnippetCreationForm />
        </div>
      );
}
