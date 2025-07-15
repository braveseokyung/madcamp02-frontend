// src/SocialGoogle.tsx
import React, { useEffect } from 'react';
import axios from 'axios';
import type { Profile } from './types';

interface SocialGoogleProps {
  onLoginSuccess: (userToken: string) => void; // 구글 access token은 백엔드에서만 관리하고 프론트엔드로는 자체 JWT만 전달
}

interface GoogleLoginResponse {
  token: string;
  user: Profile;    // 앞서 만든 User 인터페이스를 재사용
}


const SocialGoogle: React.FC<SocialGoogleProps> = ({ onLoginSuccess }) => {
  // .env 파일에서 구글 클라이언트 ID 가져오기
  const GOOGLE_CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // IMPORTANT: 이 redirect_uri는 구글 개발자 콘솔에 등록될 프론트엔드의 콜백 URI입니다.
  // 이 경로로 인가 코드를 받을 것입니다.
  // 예: http://localhost:5173/auth/google/callback
  const GOOGLE_REDIRECT_URI: string = 'https://facer-lake.vercel.app/auth/callback';
//   const GOOGLE_REDIRECT_URI: string = 'http://localhost:5173/auth/callback';

  // 백엔드 로그인 엔드포인트 (VM IP 주소와 포트로 변경 필요)
  const BACKEND_LOGIN_URI: string = 'https://facer.org/auth/google/login';

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error("환경 변수 'VITE_GOOGLE_CLIENT_ID'가 설정되지 않았습니다.");
      alert("구글 로그인 설정에 문제가 있습니다. 관리자에게 문의하세요.");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    // URL에서 코드 또는 에러 파라미터를 제거하여 URL을 깔끔하게 유지
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
      console.error('구글 인증 오류:', error);
      alert('구글 로그인 중 오류가 발생했습니다: ' + error);
      return;
    }

    if (code) {
      console.log('프론트엔드에서 인가 코드 수신:', code);
      // 인가 코드를 백엔드로 전송하여 토큰 교환 및 로그인 처리 요청
      sendCodeToBackend(code);
    }
  }, [GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, BACKEND_LOGIN_URI, onLoginSuccess]);

  const sendCodeToBackend = async (code: string) => {
    try {
      const response = await axios.post<GoogleLoginResponse>(BACKEND_LOGIN_URI, { code });
      console.log('백엔드로부터 구글 로그인 응답:', response.data);

      const { token: userToken } = response.data;

      if (userToken) {
        onLoginSuccess(userToken);
      } else {
        alert('로그인 처리 중 필수 토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('백엔드 구글 로그인 요청 중 오류 발생:', error.response ? error.response.data : error.message);
      alert('로그인 처리 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
    }
  };

  // 구글 OAuth 요청 URL 생성
  // scope: 사용자 동의를 받을 정보 (email, profile)
  // access_type=offline: refresh token을 받기 위함 (선택 사항)
  const googleURL: string = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile&access_type=offline`;

  const handleLogin = (): void => {
    if (GOOGLE_CLIENT_ID) {
      window.location.href = googleURL;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f7] text-[#222]">
      <h1 className="text-4xl font-bold mb-8">닮은꼴 찾기</h1>
      <p className="text-lg mb-12">로그인하여 서비스를 이용해주세요.</p>
      <button
        onClick={handleLogin}
        className="bg-[#4285F4] text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-[#3367D6] transition-colors"
      >
        구글 로그인
      </button>
      {!GOOGLE_CLIENT_ID && (
        <div className="mt-4 text-red-600 text-sm">
          구글 클라이언트 ID가 설정되지 않아 로그인할 수 없습니다.
        </div>
      )}
    </div>
  );
};

export default SocialGoogle;