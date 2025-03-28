import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

// Firebase の初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ローカルストレージキー
const AUTH_STORAGE_KEY = 'firebase_auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  idToken: string | null;
}

// 認証状態をローカルストレージに保存
const saveAuthState = (user: User | null, idToken: string | null) => {
  if (user && idToken) {
    const authData = {
      userId: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      idToken
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export function useFirebaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    idToken: null
  });

  // 認証状態変更リスナー
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ユーザーがログインしている場合、IDトークンを取得
        try {
          const token = await user.getIdToken();
          setAuthState({
            user,
            loading: false,
            error: null,
            idToken: token
          });
          
          // ローカルストレージに保存
          saveAuthState(user, token);
        } catch (err) {
          console.error('トークン取得エラー:', err);
          setAuthState({
            user,
            loading: false,
            error: 'トークンの取得に失敗しました',
            idToken: null
          });
          saveAuthState(null, null);
        }
      } else {
        // ログアウト状態
        setAuthState({
          user: null,
          loading: false,
          error: null,
          idToken: null
        });
        saveAuthState(null, null);
      }
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // トークンの定期的な更新（1時間ごと）
  useEffect(() => {
    let tokenRefreshInterval: NodeJS.Timeout | null = null;
    
    if (authState.user) {
      tokenRefreshInterval = setInterval(async () => {
        try {
          const token = await authState.user?.getIdToken(true);
          if (token) {
            setAuthState(prev => ({
              ...prev,
              idToken: token
            }));
            saveAuthState(authState.user, token);
          }
        } catch (err) {
          console.error('トークン更新エラー:', err);
        }
      }, 55 * 60 * 1000); // 55分ごとに更新（標準のトークン有効期限は1時間）
    }
    
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [authState.user]);

  // Google ログイン関数
  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithPopup(auth, googleProvider);
      // 認証状態リスナーが状態を更新
    } catch (error) {
      console.error('ログインエラー:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Googleログインに失敗しました'
      }));
    }
  };

  // ログアウト関数
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignOut(auth);
      // 認証状態リスナーが状態を更新
    } catch (error) {
      console.error('ログアウトエラー:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'ログアウトに失敗しました'
      }));
    }
  };

  return {
    ...authState,
    signInWithGoogle,
    signOut
  };
}
