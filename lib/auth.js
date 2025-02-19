import { auth, db } from "./firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Firestore에 사용자 정보 저장
  await setDoc(doc(db, "users", user.uid), {
    userId: user.uid,
    name: user.displayName,
    email: user.email,
    createdAt: new Date()
  });

  return user;
};
