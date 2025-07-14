// // src/SocialGoogle.tsx
// import React, { useEffect } from 'react';
// import axios from 'axios';

// interface SocialGoogleProps {
//   onLoginSuccess: (userToken: string) => void; // 구글 access token은 백엔드에서만 관리하고 프론트엔드로는 자체 JWT만 전달
// }

// interface EmailLoginProps {
//   onLoginSuccess: (userToken: string) => void;
// }


// const SocialGoogle: React.FC<SocialGoogleProps> = ({ onLoginSuccess }) => {
//   // .env 파일에서 구글 클라이언트 ID 가져오기
//   const GOOGLE_CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID;

//   // IMPORTANT: 이 redirect_uri는 구글 개발자 콘솔에 등록될 프론트엔드의 콜백 URI입니다.
//   // 이 경로로 인가 코드를 받을 것입니다.
//   // 예: http://localhost:5173/auth/google/callback
//   const GOOGLE_REDIRECT_URI: string = 'http://localhost:5173/auth/callback';

//   // 백엔드 로그인 엔드포인트 (VM IP 주소와 포트로 변경 필요)
//   const BACKEND_LOGIN_URI: string = 'http://172.20.12.113:80/auth/google/login';

//   useEffect(() => {
//     if (!GOOGLE_CLIENT_ID) {
//       console.error("환경 변수 'VITE_GOOGLE_CLIENT_ID'가 설정되지 않았습니다.");
//       alert("구글 로그인 설정에 문제가 있습니다. 관리자에게 문의하세요.");
//       return;
//     }

//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get('code');
//     const error = urlParams.get('error');

//     // URL에서 코드 또는 에러 파라미터를 제거하여 URL을 깔끔하게 유지
//     window.history.replaceState({}, document.title, window.location.pathname);

//     if (error) {
//       console.error('구글 인증 오류:', error);
//       alert('구글 로그인 중 오류가 발생했습니다: ' + error);
//       return;
//     }

//     if (code) {
//       console.log('프론트엔드에서 인가 코드 수신:', code);
//       // 인가 코드를 백엔드로 전송하여 토큰 교환 및 로그인 처리 요청
//       sendCodeToBackend(code);
//     }
//   }, [GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, BACKEND_LOGIN_URI, onLoginSuccess]);

//   const sendCodeToBackend = async (code: string) => {
//     try {
//       const response = await axios.post(BACKEND_LOGIN_URI, { code });
//       console.log('백엔드로부터 구글 로그인 응답:', response.data);

//       const { token: userToken } = response.data;

//       if (userToken) {
//         onLoginSuccess(userToken);
//       } else {
//         alert('로그인 처리 중 필수 토큰을 받지 못했습니다.');
//       }
//     } catch (error: any) {
//       console.error('백엔드 구글 로그인 요청 중 오류 발생:', error.response ? error.response.data : error.message);
//       alert('로그인 처리 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   // 구글 OAuth 요청 URL 생성
//   // scope: 사용자 동의를 받을 정보 (email, profile)
//   // access_type=offline: refresh token을 받기 위함 (선택 사항)
//   const googleURL: string = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile&access_type=offline`;

//   const handleLogin = (): void => {
//     if (GOOGLE_CLIENT_ID) {
//       window.location.href = googleURL;
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f7] text-[#222]">
//       <h1 className="text-4xl font-bold mb-8">닮은꼴 찾기</h1>
//       <p className="text-lg mb-12">로그인하여 서비스를 이용해주세요.</p>
//       <button
//         onClick={handleLogin}
//         className="bg-[#4285F4] text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-[#3367D6] transition-colors"
//       >
//         구글 로그인
//       </button>
//       {!GOOGLE_CLIENT_ID && (
//         <div className="mt-4 text-red-600 text-sm">
//           구글 클라이언트 ID가 설정되지 않아 로그인할 수 없습니다.
//         </div>
//       )}
//     </div>
//   );
// };

// export default SocialGoogle;


// src/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGoogle } from 'react-icons/fa';

interface LoginPageProps {
  onLoginSuccess: (userToken: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // --- 환경 변수 & 엔드포인트 ---
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = 'http://localhost:5173/auth/callback';
  const BACKEND_GOOGLE_LOGIN_URI = 'http://172.20.12.113:80/auth/google/login';
  const BACKEND_EMAIL_LOGIN_URI = 'http://172.20.12.113:80/auth/email/login';
  const BACKEND_REGISTER_URI    = 'http://172.20.12.113:80/auth/register';

  // --- 공통 상태 ---
  const [isRegistering, setIsRegistering] = useState(false);

  // --- 로그인 상태 ---
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError,    setLoginError]    = useState<string | null>(null);

  // --- 회원가입 상태 ---
  const [nick,     setNick]     = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass,  setRegPass]  = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // --- 구글 OAuth 처리 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code  = params.get('code');
    const error = params.get('error');
    if (code || error) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (error) {
      alert('구글 로그인 오류: ' + error);
    } else if (code) {
      axios.post(BACKEND_GOOGLE_LOGIN_URI, { code })
        .then(res => {
          const token = res.data.token;
          if (token) onLoginSuccess(token);
        })
        .catch(err => {
          alert('구글 로그인 실패: ' + (err.response?.data?.message || err.message));
        });
    }
  }, []);

  // --- 이메일 로그인 핸들러 ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await axios.post(BACKEND_EMAIL_LOGIN_URI, {
        email: loginEmail,
        password: loginPassword,
      });
      const token = res.data.token;
      if (token) {
        onLoginSuccess(token);
      } else {
        setLoginError('로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || '이메일 로그인 중 오류가 발생했습니다.');
    }
  };

  // --- 회원가입 핸들러 ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);
    try {
      await axios.post(BACKEND_REGISTER_URI, {
        email: regEmail,
        nickname: nick,
        password: regPass,
      });
      setRegSuccess('회원가입이 완료되었습니다! 로그인 해주세요.');
      // 폼 초기화
      setNick(''); setRegEmail(''); setRegPass('');
      // 자동으로 로그인 폼으로 돌아가기
      setTimeout(() => setIsRegistering(false), 1500);
    } catch (err: any) {
      setRegError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  // --- 구글 OAuth URL (state 생략) ---
  const googleURL = [
    'https://accounts.google.com/o/oauth2/v2/auth',
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID!)}`,
    `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}`,
    'response_type=code',
    'scope=openid%20email%20profile',
    'access_type=offline',
    'prompt=select_account',
  ].join('&');

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* 상단 로고 */}
      <img
        // src={logoSrc}
        alt="InsideBox"
        className="absolute top-8 left-8 w-32"
      />

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg px-8 py-10 space-y-4">
        {!isRegistering ? (
          <>
            <p className="text-gray-500 text-sm">Please enter your details</p>
            <h1 className="text-3xl font-bold">Welcome back</h1>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
              />
              {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-3 rounded-lg hover:opacity-95 transition"
              >
                로그인
              </button>
            </form>

            <button
              onClick={() => window.location.href = googleURL}
              className="w-full mt-4 border border-gray-300 rounded-lg flex items-center justify-center py-3 hover:bg-gray-50 transition"
            >
              <FaGoogle className="text-xl mr-2" />
              <span className="font-medium">Sign in with Google</span>
            </button>

            <p className="text-center text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsRegistering(true)}
              >
                회원가입
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm">Create your account</p>
            <h1 className="text-3xl font-bold">Sign up</h1>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Nickname"
                value={nick}
                onChange={e => setNick(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email address"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring focus:border-blue-500"
              />

              {regError   && <p className="text-red-600 text-sm">{regError}</p>}
              {regSuccess && <p className="text-green-600 text-sm">{regSuccess}</p>}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium py-3 rounded-lg hover:opacity-95 transition"
              >
                회원가입
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsRegistering(false)}
              >
                로그인
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
