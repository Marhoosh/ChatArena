import { useEffect, useState } from "react";
import { useSession } from "../session/SessionContext";
import { getUsageByUserId } from "~db/index";
import type { Usage } from "~db/schema";


export default function UsageModal() {
    const { session } = useSession();
    const [usage, setUsage] = useState<Usage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchUsage = async () => {
            if (!session?.user?.id) {
                setUsage(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const result = await getUsageByUserId(session.user.id);
                if (!cancelled) {
                    setUsage(result);
                }
            } catch (error) {
                console.error("Failed to fetch usage data", error);
                if (!cancelled) {
                    setUsage(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchUsage();

        return () => {
            cancelled = true;
        };
    }, [session?.user?.id]);

    if (!session || loading) {
        return null;
    }

    return (
        <div>
            <h1>Basic: {usage?.basic ?? 0}</h1>
            <h1>Advanced: {usage?.advanced ?? 0}</h1>
            <h1>Images: {usage?.images ?? 0}</h1>
        </div>
    )
}
