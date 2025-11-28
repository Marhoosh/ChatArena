// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPb4k93-cYTfTdaFIaJ36JfgB95TcFB6Y",
  authDomain: "chatarena-88141.firebaseapp.com",
  projectId: "chatarena-88141",
  storageBucket: "chatarena-88141.firebasestorage.app",
  messagingSenderId: "37729554920",
  appId: "1:37729554920:web:bf9df09bdbbc221913545d",
  measurementId: "G-XJELXCG4PF"
};

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 获取认证对象
export const auth = getAuth(app);