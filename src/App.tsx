// App.tsx
import React, { useState, useEffect } from 'react';
import {
  FaHome,
  FaUser,
  FaBell,
  FaTrophy,
  FaSignOutAlt,
  FaUser as FaUserIcon,
} from 'react-icons/fa';
import First from './first';
import FriendList from './friendlist';
import ContestTab from './contesttab';
import NotificationTab from './notification';
import SocialGoogle from './LoginPage';
import axios from 'axios';
import ProfileModal from './profilemodal';
import {
  uploadUserPhoto,
  getSimilarAnimal,
  getSimilarCelebrity,
} from '@/services/uploadService';
import type { Profile } from './types';

type ProfileImgType = string | null;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ProfileResponse {
  user: Profile;
}

const SidebarMenus = [
  { label: '닮은꼴', icon: FaHome },
  { label: '내 친구', icon: FaUser },
  { label: '콘테스트', icon: FaTrophy },
  { label: '수신함', icon: FaBell },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [selectedMenuIdx, setSelectedMenuIdx] = useState<number>(0);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [profileImg, setProfileImg] = useState<ProfileImgType>(null);
  const [animalName, setAnimalName] = useState<string>('');
  const [celebrityName, setCelebrityName] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{
    userid: number;
    nickname: string;
  } | null>(null);

  useEffect(() => {
    const storedUserToken = localStorage.getItem('userToken');
    if (storedUserToken) {
      setIsLoggedIn(true);
      setUserToken(storedUserToken);
    }
  }, []);

  useEffect(() => {
    if (!userToken) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get<ProfileResponse>(
          `${BACKEND_URL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
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

  const handleLoginSuccess = (appToken: string) => {
    setIsLoggedIn(true);
    setUserToken(appToken);
    localStorage.setItem('userToken', appToken);
    // 프로필 사진이 없다면, 기본적으로 null(state 초기값)이므로 사람 아이콘으로!
    alert('구글 로그인 성공!');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserToken(null);
    localStorage.removeItem('userToken');
    alert('로그아웃 되었습니다.');
  };

  const handleProfileImgChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userToken) return;
    setProfileImg(URL.createObjectURL(file));
    try {
      const photo = await uploadUserPhoto(file);
      const embeddingArray = JSON.parse(photo.embedding) as number[];
      if (!Array.isArray(embeddingArray)) throw new Error('임베딩 포맷 오류');
      setProfileImg(photo.image_url);
      const { animal } = await getSimilarAnimal(
        photo.image_url,
        photo.facial_area.x,
        photo.facial_area.y,
        photo.facial_area.w,
        photo.facial_area.h
      );
      const celebRes = await getSimilarCelebrity(embeddingArray);
      setCelebrityName(celebRes.name);
      setAnimalName(animal);
    } catch (err) {
      console.error('이미지 업로드 실패', err);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  if (!isLoggedIn) {
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
            {profileImg ? (
              <img
                src={profileImg}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserIcon size={64} color="#fff" />
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
            handleProfileImgChange={handleProfileImgChange}
            animalName={animalName}
            celebrityName={celebrityName}
            nickname={userInfo?.nickname ?? ''}
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
        nickname={userInfo?.nickname ?? ''}
        email="helloworld@naver.com"
      />
    </div>
  );
};

export default App;
