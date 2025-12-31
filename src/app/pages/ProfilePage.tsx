import { useTranslation } from "react-i18next";
import { useSession } from "~app/components/session/SessionContext";
import { supabase } from "~db";

export default function ProfilePage() {
    const { t } = useTranslation()

    const { session } = useSession();


    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (!session) {
        
        return (
            <div>
                <p>{t('pleaseLoginFirst')}</p>
            </div>
        )
    }

    console.log(session.user)

    return (
        <div>
            <h1>{t('profilePageTitle')}</h1>
            <div>
                <p>{t('avatar')}：<img src={session.user.user_metadata?.avatar_url}  /></p>
                <p>{t('username')}：{session.user.user_metadata?.full_name}</p>
                <p>{t('email')}：{session.user.user_metadata?.email}</p>

                <button onClick={handleLogout}>
                    {t('signOut')}
                </button>
            </div>
        </div>
    )
}