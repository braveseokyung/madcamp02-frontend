// First.tsx
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import Webcam from 'react-webcam';

interface FirstProps {
  profileImg: string | null;
  // pendingImg: string | null;
  handleProfileImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  animalName: string | null;
  celebrityName: string | null;
  myNickname: string | null;
}

const First: React.FC<FirstProps> = ({
  profileImg,
  // pendingImg,
  handleProfileImgChange,
  animalName,
  celebrityName,
  myNickname,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // const [celebrityImg, setCelebrityImg] = useState<string | null>(null);
  // const [animalImg, setAnimalImg] = useState<string | null>(null);


  // 파일 업로드 핸들러
  const onProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    await handleProfileImgChange(e);
    setTimeout(() => setIsLoading(false), 2000);
  };

  // 웹캠 촬영 핸들러
  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], 'webcam.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            const input = document.createElement('input');
            input.type = 'file';
            input.files = dt.files;
            const event = {
              target: input,
            } as React.ChangeEvent<HTMLInputElement>;
            onProfileChange(event);
          });
      }
      setShowWebcam(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-screen-lg mx-auto">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 w-72">
            <svg
              className="w-6 h-6 animate-spin text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
        {myNickname || '닉네임 없음'} 님의 닮은꼴
      </h1>

      {/* 웹캠 촬영 버튼: 카드 바깥 위쪽 */}
      <button
        onClick={() => setShowWebcam(true)}
        className="mb-4 px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-base"
      >
        웹캠으로 사진 찍기
      </button>

      {/* 이미지 업로드 카드: 클릭시 파일 업로드 */}
      <div className="flex gap-12 w-full justify-center mb-6">
        <Card className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl w-full max-w-[700px] min-w-[350px] h-[600px] overflow-hidden relative cursor-pointer transition-colors duration-200 hover:border-indigo-400">
          <label
            htmlFor="profile-upload"
            className="flex flex-col w-full h-full items-center justify-center px-8 py-6 cursor-pointer"
          >
            <div className="flex-1 flex items-center justify-center w-full h-full">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="내 사진"
                  className="w-full h-full object-contain max-h-[540px] max-w-[640px]"
                />
              ) : (
                <div className="text-gray-400 text-xl">내 사진 업로드</div>
              )}
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onProfileChange}
            />
          </label>
          {/* 웹캠 모달 */}
          {showWebcam && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-20">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                width={420}
                height={560}
                videoConstraints={{
                  facingMode: 'user',
                  width: 640,
                  height: 540,
                }}
                className="rounded-lg"
              />
              <button
                onClick={handleCapture}
                className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-base"
              >
                사진 찍기
              </button>
              <button
                onClick={() => setShowWebcam(false)}
                className="mt-2 px-4 py-1 text-gray-600 text-sm"
              >
                취소
              </button>
            </div>
          )}
        </Card>
      </div>

      {!isLoading && profileImg && (
        <div className="flex w-full justify-between mt-6 space-x-6">
          {/* 닮은 연예인 */}
          <div className="relative w-[47%] h-80 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
            {celebrityName && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-base font-semibold text-indigo-600 whitespace-nowrap">
                {celebrityName}
              </div>
            )}
            {celebrityName ? (
              <img
                src={`/assets/celeb/${celebrityName}.jpg`}
                alt="닮은 연예인"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span>닮은 연예인</span>
            )}
          </div>
          {/* 동물상 */}
          <div className="relative w-[47%] h-80 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
            {animalName && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-base font-semibold text-amber-600 whitespace-nowrap">
                {animalName}
              </div>
            )}
            {animalName ? (
              <img
                src={`/assets/animals/${animalName}.jpg`}
                alt="동물상"
                className="max-w-full max-h-full object-contain"
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
