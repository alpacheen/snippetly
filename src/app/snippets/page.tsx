import { supabase } from "@/lib/supabase";
import SnippetCard from "../components/SnippetCard";

export const dynamic = 'force-dynamic';


export default async function SnippetsPage(){
    //Fetch snippets from the database
    const { data: snippets, error } =  await supabase
    .from('snippets')
    .select('id,title,language');

    if( error) {
        console.error(error);
        return <p className="text-red-500">Failed to load snippets</p>;
    }

    return(
        <section>
            <h1 className="text-2xl font-bold mb-4">Browse Snippets</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {snippets?.map((snippet) =>(
                    <SnippetCard 
                        key={snippet.id}
                        title={snippet.title}
                        language={snippet.language}
                        href={`/snippets/${snippet.id}`}
                    />
                ))}
                <div className="border p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold">Debounce Function</h2>
                    <p className="text-sm text-neutral-500">Javascript</p>
                    <button className="mt-2 text-blue-600 hover:underline">View Snippet</button>
                </div>
                {/* Add more snippets */}
            </div>
        </section>
    )
}