"use client";

import {useState} from "react";
import CommentsList from "./CommentsList";
import NewCommentForm from "./NewCommentForm";

type Props = {
    snippetId: string;
};

export default function CommentsSection({snippetId}: Props){
const [refreshTrigger,setRefreshTrigger] = useState(0);

const handleCommentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
};

return (
    <div>
        <CommentsList snippetId={snippetId} refreshTrigger={refreshTrigger}/>
        <NewCommentForm snippetId={snippetId} onCommentAdded={handleCommentAdded}/>
    </div>
)
}