import { useState, useEffect, FC } from "react";
import { createClient } from "@supabase/supabase-js";
import { Session, EmailOtpType } from "@supabase/gotrue-js/src/lib/types"
import Dialog from '../Dialog'
import { useTranslation } from "react-i18next";

// 扩展 Window 接口以包含我们的自定义属性
declare global {
  interface Window {
    handleSignInWithGoogle: (response: any) => Promise<void>;
    google: any;
  }
}

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// 将Google登录处理函数添加到全局作用域
window.handleSignInWithGoogle = async function(response) {
    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
    });

};

// 动态加载Google Sign-In脚本
function loadGoogleScript(){
    const existingScript = document.getElementById('google-signin-script');
    if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-signin-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        document.body.appendChild(script);
    }
}



// 初始化Google登录按钮
function initializeGoogleSignIn(){
    loadGoogleScript()
    // 确保Google库已加载
    if (window.google && window.google.accounts && window.google.accounts.id) {


        // 重新初始化Google登录
        window.google.accounts.id.initialize({
            client_id: "280072408180-88habribp82fhbdpt10p7806r1a6j110.apps.googleusercontent.com",
            callback: window.handleSignInWithGoogle,
            context: "signin",
            ux_mode: "popup",
            auto_prompt: "false"
        });
        
        // 渲染登录按钮
        window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            {
                type: "standard",
                shape: "rectangular",
                theme: "outline",
                text: "continue_with",
                size: "large",
                logo_alignment: "left"
            }
        );
    }else {
        // 如果Google库仍未加载，等待一段时间后重试
        setTimeout(initializeGoogleSignIn, 100);
    }
};

interface Props {
  open: boolean
  onClose: () => void
}

const SignModal: FC<Props> = (props) => {
    const { t, i18n } = useTranslation()
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [session, setSession] = useState<Session | null>(null);

    // Check URL params on initial render
    const params = new URLSearchParams(window.location.search);
    const hasTokenHash = params.get("token_hash");

    const [verifying, setVerifying] = useState(!!hasTokenHash);
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState(false);

    useEffect(() => {
        if (!props.open) return;
        initializeGoogleSignIn();

        // Check if we have token_hash in URL (magic link callback)
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get("token_hash");
        const type = params.get("type");

        if (token_hash) {
            // Verify the OTP token
            supabase.auth.verifyOtp({
                token_hash,
                type: (type as EmailOtpType) || "email",
            }).then(({ error }) => {
                if (error) {
                    setAuthError(error.message);
                } else {
                    setAuthSuccess(true);
                    // Clear URL params
                    window.history.replaceState({}, document.title, "/");
                }
                setVerifying(false);
            });
        }

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [props.open]);

    useEffect(() => {
        initializeGoogleSignIn();
    }, [session]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });
        if (error) {
            alert(error.message);
        } else {
            alert("Check your email for the login link!");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    // Show verification state
    if (verifying) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>Confirming your magic link...</p>
                <p>Loading...</p>
            </div>
        );
    }

    // Show auth error
    if (authError) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>✗ Authentication failed</p>
                <p>{authError}</p>
                <button
                    onClick={() => {
                        setAuthError(null);
                        window.history.replaceState({}, document.title, "/");
                    }}
                >
                    Return to login
                </button>
            </div>
        );
    }

    // Show auth success (briefly before session loads)
    if (authSuccess && !session) {
        return (
            <div>
                <h1>Authentication</h1>
                <p>✓ Authentication successful!</p>
                <p>Loading your account...</p>
            </div>
        );
    }

    // If user is logged in, show welcome screen
    if (session) {
        return (
            <div>
                <h1>Welcome!</h1>
                <p>You are logged in as: {session.user.email}</p>
                <button onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        );
    }

    // Show login form
    return (
        <Dialog
            title={t('Sign In')}
            open={props.open}
            onClose={props.onClose}
            className="rounded-xl w-[600px] min-h-[300px]"
        >
            <div>

                <h1>Supabase + React</h1>
                <p>Sign in via magic link with your email below</p>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        required={true}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button disabled={loading}>
                        {loading ? <span>Loading</span> : <span>Send magic link</span>}
                    </button>
                </form>

                <div id="google-signin-button"></div>

            </div>
        </Dialog>
        
    );
}

export default SignModal