import { useTranslation } from "react-i18next";
import { getSessionUser } from "~app/components/session/SessionContext";
import { supabase } from "~db";

export default function ProfilePage() {
    const { t } = useTranslation()

    const user = getSessionUser();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };




    return (
        <div>
            <h1>{t('profilePageTitle')}</h1>
            <div>
                <p>{t('avatar')}：<img src={user?.user_metadata?.avatar_url}  /></p>
                <p>{t('username')}：{user?.user_metadata?.full_name}</p>
                <p>{t('email')}：{user?.user_metadata?.email}</p>

                <button onClick={handleLogout}>
                    {t('signOut')}
                </button>
            </div>
        </div>
    )
}