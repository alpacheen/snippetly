export default function SnippetsPage(){
    //Fetch snippets from the database

    return(
        <section>
            <h1 className="text-2xl font-bold mb-4">Browse Snippets</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
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