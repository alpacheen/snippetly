type SnippetCardProps = {
    title: string;
    language: string;
    href: string;
}

export default function SnippetCard({ title, language, href }: SnippetCardProps) {
    return (
        <div className="border p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-neutral-500">{language}</p>
            <a href={href} className="mt-2 inline-block text-blue-600 hover:underline">View Snippet</a>
        </div>
    )
}