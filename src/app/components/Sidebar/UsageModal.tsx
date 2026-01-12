import { useEffect, useState } from "react";
import { useSession } from "../session/SessionContext";
import { usageService } from "../../../db/services/usage";
import { UsageModel } from "../../../types/usage";
import { useTranslation } from "react-i18next";


export default function UsageModal() {
    const { t } = useTranslation()
    const { session } = useSession();
    const [usageStats, setUsageStats] = useState<UsageModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsageData = async () => {
            if (!session?.user?.id) return;
            
            try {
                setLoading(true);
                const { usage, error } = await usageService.getUserUsage(session.user.id);
                
                if (error) {
                    setError(error.message);
                } else {
                    setUsageStats(usage);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
            } finally {
                setLoading(false);
            }
        };

        fetchUsageData();
    }, []);

    if (!session) {
        return null;
    }

    if (loading) {
        return (
            <div>
                <h1>{t('loadingUsageData')}</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>{t('errorFetchingUsageData')}: {error}</h1>
            </div>
        );
    }
    return (
        <div>
            <h1>{t('basic')}: {usageStats?.basicUsage || 0}, {t('limit')}: {usageStats?.basicLimit || 0}</h1>
            <h1>{t('advanced')}: {usageStats?.advancedUsage || 0}, {t('limit')}: {usageStats?.advancedLimit || 0}</h1>
            <h1>{t('image')}: {usageStats?.genImageUsage || 0}, {t('limit')}: {usageStats?.genImageLimit || 0}</h1>
        </div>
    )
}
