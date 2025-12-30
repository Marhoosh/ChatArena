import { useEffect, useState } from "react";
import { useSession } from "../session/SessionContext";
import { usageService } from "../../../db/services/usage";


export default function UsageModal() {
    const { session } = useSession();
    const [usageStats, setUsageStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsageData = async () => {
            if (!session?.user?.id) return;
            
            try {
                setLoading(true);
                const { stats, error } = await usageService.getTotalUsageByUser(session.user.id);
                
                if (error) {
                    setError(error.message);
                } else {
                    setUsageStats(stats);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
            } finally {
                setLoading(false);
            }
        };

        fetchUsageData();
    }, [session]);

    if (!session) {
        return null;
    }

    if (loading) {
        return (
            <div>
                <h1>Loading usage data...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Error: {error}</h1>
            </div>
        );
    }

    return (
        <div>
            <h1>Basic: {usageStats?.totalBasic || 0}</h1>
            <h1>Advanced: {usageStats?.totalAdvanced || 0}</h1>
            <h1>Images: {usageStats?.totalImages || 0}</h1>
        </div>
    )
}
