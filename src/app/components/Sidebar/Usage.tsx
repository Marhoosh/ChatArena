import { useSession } from "../session/SessionContext";

export default function Usage() {
    const session = useSession();

    if (!session) {
        return null;
    }

    return (
        <div>
            <h1>Basic:</h1>
            <h1>Advanced:</h1>
            <h1>Images:</h1>
        </div>
    )
}