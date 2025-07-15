// first.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface FirstProps {
  profileImg: string | null;
  // pendingImg: string | null;
  handleProfileImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  animalName: string | null;
  celebrityName: string | null;
  // animalImg: string | null;
  // handlePendingImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const First: React.FC<FirstProps> = ({
  profileImg,
  // pendingImg,
  handleProfileImgChange,
  animalName,
  celebrityName
  // animalImg
  // handlePendingImgChange,
}) => {

  const [isLoading, setIsLoading] = useState(false);
  // const [celebrityImg, setCelebrityImg] = useState<string | null>(null);
  // const [animalImg, setAnimalImg] = useState<string | null>(null);

  // ② 파일 변경 핸들러 정의 (컴포넌트 바디 안, return 위)
  const onProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    await handleProfileImgChange(e);  // 실제 업로드/처리 로직
    setTimeout(() => {
    setIsLoading(false);             // 2초 뒤에 모달 닫기
  }, 2000);

  };

  return (

    <div className="flex flex-col items-center w-full max-w-screen-lg mx-auto">
      {isLoading && (
        <div
          className="
            absolute
            top-1/2 left-1/2
            transform -translate-x-1/2 -translate-y-1/2
            z-10
          "
        >
          <div
            className="
              bg-white
              p-6
              rounded-xl
              shadow-lg
              flex items-center space-x-4
              w-72
            "
          >
            <svg
              className="w-6 h-6 animate-spin text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-gray-700 font-medium">닮은꼴을 찾는 중…</span>
          </div>
        </div>
      )}

      <h1 className="text-3xl text-center font-bold mb-8 w-full">
        닉네임 님의 닮은꼴
      </h1>

      {/* 이미지 업로드 섹션 */}
      <div className="flex gap-12 w-full justify-center mb-6">
        {/* 내 사진 업로드 */}
        <Card
          className="
            flex-1 min-w-[300px] max-w-500px] h-[450px]
            flex items-center justify-center
            rounded-2xl
            border-2 border-dashed border-gray-300
            hover:border-gray-400
            transition-colors duration-200
          "
        >
          <label
            htmlFor="profile-upload"
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
          >
            {profileImg ? (
              <img
                src={profileImg}
                alt="내 사진"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-lg">내 사진 업로드</div>
            )}
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onProfileChange}
            />
          </label>
        </Card>

      </div>

      {!isLoading && profileImg && (
        <div className="flex w-full justify-between mt-6 space-x-6">
          {/* 닮은 연예인 */}
          <div className="
            w-[47%] h-50
            bg-white
            rounded-lg
            border border-gray-200
            shadow-sm
            flex items-center justify-center
            text-gray-800 font-medium
          ">
            {celebrityName ? (
              <img
                src={`/assets/celeb/${celebrityName}.jpg`}
                alt="닮은 연예인"
                className="w-full h-full object-contain"
              />
            ) : (
              <span>닮은 연예인</span>
            )}
          </div>
          {/* 동물상 */}
          <div className="
            w-[47%] h-50
            bg-white
            rounded-lg
            border border-gray-200
            shadow-sm
            flex items-center justify-center
            text-gray-800 font-medium
          ">
            {animalName ? (
              <img
                src={`/assets/animals/${animalName}.jpg`} 
                alt="동물상"
                className="w-full h-full object-contain"
              />
            ) : (
              <span>동물상</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default First;
