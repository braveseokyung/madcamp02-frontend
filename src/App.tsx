// App.tsx
import React, { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogClose,
// } from '@/components/ui/dialog';
import First from './first';
import FriendList from './friendlist';
import ContestTab from './contesttab';
import NotificationTab from './notification';
import SocialGoogle from './LoginPage'; // SocialKakao 대신 SocialGoogle 임포트
import axios from 'axios';
import { FaHome, FaUser, FaBell, FaTrophy, FaSignOutAlt } from 'react-icons/fa';
import {
  uploadUserPhoto,
  getSimilarAnimal,
  getSimilarCelebrity,
} from '@/services/uploadService';
import type { Profile } from './types';
import ProfileModal from './profilemodal';

type ProfileImgType = string | null;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


interface ProfileResponse {
  user: Profile;
}

// interface UserProfile {
//   user_id: number;
//   nickname: string | null;
//   profile_image_url: string | null;
//   // 필요시 추가 필드
// }

// const tabList = [
//   { label: '사진 업로드', value: 'upload' },
//   { label: '친구', value: 'friend' },
// ];

const SidebarMenus = [
  { label: '닮은꼴', icon: FaHome },
  { label: '내 친구', icon: FaUser },
  { label: '콘테스트', icon: FaTrophy },
  { label: '수신함', icon: FaBell },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null); // 백엔드에서 발급한 앱 토큰 (JWT 등)
  const [selectedMenuIdx, setSelectedMenuIdx] = useState<number>(0);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [profileImg, setProfileImg] = useState<ProfileImgType>(null);
  // const [pendingImg, setPendingImg] = useState<ProfileImgType>(null);
  const [animalName, setAnimalName] = useState<string>('');
  const [celebrityName, setCelebrityName] = useState<string>('');

  const [userInfo, setUserInfo] = useState<{
    userid: number;
    nickname: string;
  } | null>(null);

  useEffect(() => {
    // 초기 로드 시 로컬 스토리지에 토큰이 있는지 확인하여 로그인 상태 유지
    const storedUserToken = localStorage.getItem('userToken');
    console.log(localStorage.getItem('userToken'));

    if (storedUserToken) {
      // Google 로그인 시에는 자체 userToken만 확인
      setIsLoggedIn(true);
      setUserToken(storedUserToken);
    }
  }, []);

  // 2. 토큰이 세팅되면 프로필 정보 요청
  useEffect(() => {
    if (!userToken) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get<ProfileResponse>(`${BACKEND_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        console.log(res.data.user);
        setUserInfo({
          nickname: res.data.user.nickname,
          userid: res.data.user.id,
        });
        setProfileImg(res.data.user.profile_image_url);
      } catch (err) {
        console.error('프로필 정보 조회 실패', err);
      }
    };
    fetchProfile();
  }, [userToken]);

  // handleLoginSuccess 함수 시그니처 변경: Google 로그인에서는 userToken만 받음
  const handleLoginSuccess = (appToken: string) => {
    setIsLoggedIn(true);
    setUserToken(appToken);
    localStorage.setItem('userToken', appToken);
    alert('구글 로그인 성공!');
  };

  const handleLogout = async () => {
    // 프론트엔드 상태 및 스토리지 클리어
    setIsLoggedIn(false);
    setUserToken(null);
    localStorage.removeItem('userToken');
    alert('로그아웃 되었습니다.');
  };

  // async 함수로 만들고 service 호출
  const handleProfileImgChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userToken) return;

    // 1) 로컬 미리보기
    setProfileImg(URL.createObjectURL(file));

    try {
      // 2) uploadService의 uploadUserPhoto 호출
      const photo = await uploadUserPhoto(file);

      const embeddingArray = JSON.parse(photo.embedding) as number[];
      if (!Array.isArray(embeddingArray)) throw new Error('임베딩 포맷 오류');
      // console.log("embeddign", embeddingArray);

      // 3) 서버에 저장된 실제 URL로 프로필 이미지 업데이트
      setProfileImg(photo.image_url);
      const { animal, animal_confidence } = await getSimilarAnimal(
        photo.image_url,
        photo.facial_area.x,
        photo.facial_area.y,
        photo.facial_area.w,
        photo.facial_area.h
      );
      const celebRes = await getSimilarCelebrity(embeddingArray);
      console.log('결과', celebRes.name);
      console.log(animal_confidence);

      setCelebrityName(celebRes.name);
      setAnimalName(animal);

      // 4) 닮은 연예인·동물 이미지가 서비스에서 제공된다면 상태에 반영
      // 예시: photo.celebrity_url, photo.animal_url
      // setCelebrityImg(photo.celebrity_url || null);
      // setAnimalImg(photo.animal_url || null);
    } catch (err) {
      console.error('이미지 업로드 실패', err);
      // console.error('이미지 업로드 실패했어', err.message);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
    }
  };

  // const handlePendingImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => setPendingImg(reader.result as string);
  //     reader.readAsDataURL(file);
  //   }
  // };

  if (!isLoggedIn) {
    // 로그인되지 않았다면 SocialGoogle 컴포넌트 렌더링
    return <SocialGoogle onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] font-sans">
      {/* 사이드바 */}
      <aside className="w-50 bg-[#ededed] flex flex-col items-center pt-8">
        <div
          onClick={() => setShowProfile(true)}
          className="flex flex-col items-center bg-transparent border-none cursor-pointer mb-8 p-0"
        >
          <div className="w-36 h-36 self-start rounded-xl bg-[#3d2fd1] mb-4 overflow-hidden flex items-center justify-center">
            {profileImg && (
              <img
                src={profileImg}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="text-xl text-[#222]">
            {userInfo?.nickname || '닉네임 없음'}
          </div>
        </div>
        {SidebarMenus.map((menu, idx) => {
          const Icon = menu.icon;
          return (
            <button
              key={menu.label}
              onClick={() => setSelectedMenuIdx(idx)}
              type="button"
              className="w-[90%] flex items-center py-4 mb-3 rounded-lg text-lg cursor-pointer font-semibold border-none"
            >
              <Icon className="mr-3" size={20} />
              <span>{menu.label}</span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-[90%] mt-auto flex items-center py-4 mb-3 rounded-lg text-lg cursor-pointer font-semibold border-none"
        >
          <FaSignOutAlt className="mr-3" size={20} />
          로그아웃
        </button>
      </aside>

      {/* 메인 */}
      <main className="flex-1 pt-10 flex flex-col items-center w-full">
        {selectedMenuIdx === 0 ? (
          <First
            profileImg={profileImg}
            // pendingImg={pendingImg}
            handleProfileImgChange={handleProfileImgChange}
            animalName={animalName}
            celebrityName={celebrityName}
            // animalImg={animalName ? `./assets/animals/${animalName}.jpg` : null}
            // handlePendingImgChange={handlePendingImgChange}
          />
        ) : selectedMenuIdx === 1 ? (
          <div className="w-full flex flex-col items-center mt-16 text-2xl text-gray-600">
            <FriendList
              userToken={userToken ?? ''}
              myUserId={userInfo?.userid ?? 0}
              myNickname={userInfo?.nickname ?? ''}
            />
          </div>
        ) : selectedMenuIdx === 2 ? (
          <div className="w-full flex flex-col items-center mt-16 text-2xl text-gray-600">
            <ContestTab
              userToken={userToken ?? ''}
              myUserId={userInfo?.userid ?? 0}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center mt-16 text-2xl text-gray-600">
            <NotificationTab
              userToken={userToken ?? ''}
              userId={userInfo?.userid ?? 0}
            />
          </div>
        )}
      </main>

      {/* 프로필 모달 */}
      
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profileImg={profileImg}
        handleProfileImgChange={handleProfileImgChange}
      />
     
    </div>
  );
};

export default App;
