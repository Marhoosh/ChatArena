import { useEffect, useState } from "react";
import { useSession } from "../session/SessionContext";
import { usageService } from "../../../db/services/usage";
import { useTranslation } from "react-i18next";


export default function UsageModal() {
    const { t } = useTranslation()
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
            <h1>{t('basic')}: {usageStats?.totalBasic || 0}, {t('limit')}: {usageStats?.basic_limit || 0}</h1>
            <h1>{t('advanced')}: {usageStats?.totalAdvanced || 0}, {t('limit')}: {usageStats?.advanced_limit || 0}</h1>
            <h1>{t('image')}: {usageStats?.totalImages || 0}, {t('limit')}: {usageStats?.gen_image_limit || 0}</h1>
        </div>
    )
}
