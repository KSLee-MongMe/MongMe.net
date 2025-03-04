// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  // 초기값: localStorage에 저장된 user 정보로 설정 (네이버 로그인 후 리프래시 시 유용)
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AuthContext: onAuthStateChanged - currentUser:", currentUser);
      // Firebase Auth의 currentUser가 존재하면 우선 사용
      if (currentUser) {
        setUser(currentUser);
      } else {
        // currentUser가 null인 경우, localStorage fallback 적용
        const storedUser = localStorage.getItem("user");
        console.log("AuthContext: localStorage fallback:", storedUser);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // user 상태가 변경될 때마다 localStorage를 업데이트하여 상태를 동기화
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
