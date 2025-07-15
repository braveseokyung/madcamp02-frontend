import React, { useState } from 'react';
import axios from 'axios';
// import type { Profile } from './types';

interface EmailLoginProps {
  onLoginSuccess: (userToken: string) => void;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

/** 서버 → 클라이언트: 로그인 성공 응답 */
export interface EmailLoginResponse {
  token: string;
  user: {
    user_id: number;
    email: string;
    nickname: string;
    profile_image_url: string | null;
    is_online: boolean;
  };
}

const EmailLogin: React.FC<EmailLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // .env 파일에 VITE_BACKEND_EMAIL_LOGIN_URI 를 설정하세요
  const BACKEND_EMAIL_LOGIN_URI =
    import.meta.env.VITE_BACKEND_EMAIL_LOGIN_URI ||
    'http://172.20.12.113:80/auth/email/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await axios.post<EmailLoginResponse>(BACKEND_EMAIL_LOGIN_URI, {
        email,
        password,
      });
      const { token } = res.data;
      if (token) {
        onLoginSuccess(token);
      } else {
        setErrorMsg('로그인 토큰을 받지 못했습니다.');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || '이메일 로그인 중 오류가 발생했습니다.'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">이메일 로그인</h2>

      <label className="block mb-2">
        <span className="text-gray-700">이메일</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </label>

      <label className="block mb-4">
        <span className="text-gray-700">비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
      </label>

      {errorMsg && (
        <div className="mb-4 text-red-600 text-sm">{errorMsg}</div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-500 transition-colors"
      >
        로그인
      </button>
    </form>
  );
};

export default EmailLogin;