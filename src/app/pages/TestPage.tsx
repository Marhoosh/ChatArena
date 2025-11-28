import { useEffect, useState } from 'react';
import { auth } from '../../services/firebase-config';
import * as firebaseui from 'firebaseui';
import firebase from 'firebase/compat/app';
import 'firebaseui/dist/firebaseui.css';
import { Unsubscribe, User } from 'firebase/auth';

function TestPage() {

    // TODO 登录页国际化，比如：
    // provider.setCustomParameters({
    //     // Localize the Apple authentication screen in French.
    //     locale: 'fr'
    // });
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // 在客户端执行（避免服务端渲染问题）
        if (typeof window !== 'undefined') {
            let ui: firebaseui.auth.AuthUI | null = null;
            let unsubscribe: Unsubscribe | null= null;
            

            // 检查是否已经初始化了UI
            ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
            

            // FirebaseUI 配置
            const uiConfig = {
                callbacks: {
                    signInSuccessWithAuthResult: (authResult: firebase.auth.UserCredential, redirectUrl: string) => {
                        // 登录成功后的回调
                        console.log('登录成功:', authResult.user);
                        setUser(authResult.user as User);
                        showUserInfo(authResult.user);
                        // 返回 false 表示不自动重定向
                        return false;
                    },
                    uiShown: () => {
                        // UI 完全加载后的回调
                        console.log('FirebaseUI 已加载');
                    },
                    signInFailure: (error: any) => {
                        console.error('登录失败:', error);
                        return Promise.reject(error);
                    }
                },
                // 登录成功后重定向的URL
                signInSuccessUrl: '/',
                // 使用弹出窗口而不是重定向
                signInFlow: 'popup',
                // 登录选项
                signInOptions: [
                    // Google 登录
                    {
                        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                        customParameters: {
                            // Forces account selection even when one account
                            // is available.
                            // prompt: 'select_account'
                        }
                    },
                    // Apple 登录
                    // 'apple.com',
                    // 邮箱登录
                    {
                        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
                    },
            
                ],
                // 隐私政策和服务条款的URL
                // tosUrl: 'https://www.google.com',
                // privacyPolicyUrl: 'https://www.google.com'
            };
            
            // 启动 FirebaseUI
            ui.start('#firebaseui-auth-container', uiConfig);
            
            // 监听用户状态变化
            unsubscribe = auth.onAuthStateChanged((authUser) => {
                if (authUser) {
                    setUser(authUser);
                    showUserInfo(authUser);
                } else {
                    setUser(null);
                    hideUserInfo();
                }
            });
            
            // 设置退出登录按钮
            const signOutBtn = document.getElementById('sign-out-btn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => {
                    auth.signOut().then(() => {
                        console.log('用户已退出登录');
                    }).catch((error: any) => {
                        console.error('退出登录失败:', error);
                    });
                });
            }
             
            // 清理函数
            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
                if (ui) {
                    ui.delete();
                }
            };
        }
    }, []);
    
    // 显示用户信息
    const showUserInfo = (authUser: any) => {
        const userInfoDiv = document.getElementById('user-info');
        const userDetailsDiv = document.getElementById('user-details');
        const authContainerDiv = document.getElementById('firebaseui-auth-container');
        
        if (userInfoDiv && userDetailsDiv && authContainerDiv) {
            userDetailsDiv.innerHTML = `
                <div class="flex items-center mb-4">
                    <img src="${authUser.photoURL || '/assets/user-avatar.svg'}" alt="用户头像" class="w-16 h-16 rounded-full mr-4">
                    <div>
                        <p class="font-semibold">${authUser.displayName || '匿名用户'}</p>
                        <p class="text-sm text-gray-600">${authUser.email || ''}</p>
                    </div>
                </div>
                <p class="text-sm text-gray-500">UID: ${authUser.uid}</p>
                <p class="text-sm text-gray-500">登录方式: ${authUser.providerData[0]?.providerId || '未知'}</p>
            `;
            
            userInfoDiv.classList.remove('hidden');
            authContainerDiv.style.display = 'none';
        }
    };
    
    // 隐藏用户信息
    const hideUserInfo = () => {
        const userInfoDiv = document.getElementById('user-info');
        const authContainerDiv = document.getElementById('firebaseui-auth-container');
        
        if (userInfoDiv && authContainerDiv) {
            userInfoDiv.classList.add('hidden');
            authContainerDiv.style.display = 'block';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Test Page</h1>
            
            <div className="max-w-md mx-auto">
        
                {/* FirebaseUI 认证容器 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div id="firebaseui-auth-container"></div>
                </div>
                
                {/* 登录状态显示区域 */}
                <div id="user-info" className="mt-6 p-4 bg-gray-100 rounded-lg hidden">
                    <h2 className="text-lg font-semibold mb-2">用户信息</h2>
                    <div id="user-details"></div>
                    <button 
                        id="sign-out-btn"
                        className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                    >
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TestPage;