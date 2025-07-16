import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface FirstProps {
  profileImg: string | null;
  handleProfileImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  animalName: string | null;
  celebrityName: string | null;
  nickname: string;
}

const First: React.FC<FirstProps> = ({
  profileImg,
  handleProfileImgChange,
  animalName,
  celebrityName,
  nickname,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    await handleProfileImgChange(e);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleOpenWebcam = async () => {
    setWebcamError(null);
    setShowWebcam(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setWebcamError('웹캠 사용 권한이 없거나 장치가 없습니다.');
    }
  };

  const handleCloseWebcam = () => {
    setShowWebcam(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { videoWidth, videoHeight } = video;
        let sx = 0,
          sy = 0,
          sWidth = videoWidth,
          sHeight = videoHeight;
        if (videoWidth > videoHeight) {
          sx = (videoWidth - videoHeight) / 2;
          sWidth = videoHeight;
        } else {
          sy = (videoHeight - videoWidth) / 2;
          sHeight = videoWidth;
        }
        const destSize = 350;
        canvas.width = destSize;
        canvas.height = destSize;
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, destSize, destSize);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'webcam.jpg', {
                type: 'image/jpeg',
              });
              const event = {
                target: {
                  files: [file],
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onProfileChange(event);
              handleCloseWebcam();
            }
          },
          'image/jpeg',
          0.95
        );
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-screen-lg mx-auto">
      {/* 로딩 상태 */}
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

      {/* 헤더 */}
      <h1 className="text-3xl text-center font-bold mb-8 w-full">
        {nickname} 님의 닮은꼴
      </h1>

      {/* 업로드 + 웹캠 섹션 */}
      <div className="flex gap-12 w-full justify-center mb-6">
        <Card
          className="
            flex-1 min-w-[300px] max-w-[350px] h-[350px]
            flex items-center justify-center
            rounded-2xl border-2 border-dashed border-gray-300
            hover:border-gray-400 transition-colors duration-200
            aspect-square
          "
        >
          <label
            htmlFor="profile-upload"
            className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer aspect-square"
          >
            {/* 이미지 미리보기 */}
            {profileImg ? (
              <div className="w-full h-full aspect-square flex items-center justify-center">
                <img
                  src={profileImg}
                  alt="내 사진"
                  className="max-w-full max-h-full object-contain aspect-square"
                  style={{ aspectRatio: '1 / 1' }}
                />
              </div>
            ) : (
              <div className="text-gray-400 text-lg text-center">
                내 사진 업로드
              </div>
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

        {/* 웹캠 버튼 */}
        <div className="flex flex-col items-center justify-center ml-2">
          <button
            type="button"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold shadow hover:bg-blue-600 transition"
            onClick={handleOpenWebcam}
          >
            웹캠으로 사진 찍기
          </button>
        </div>
      </div>

      {/* 웹캠 창 */}
      {showWebcam && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
            <video
              ref={videoRef}
              width={350}
              height={350}
              autoPlay
              className="rounded mb-4 bg-black"
              style={{ aspectRatio: '1 / 1', width: 350, height: 350 }}
            />
            <canvas
              ref={canvasRef}
              width={350}
              height={350}
              className="hidden"
            />
            {webcamError && (
              <div className="text-red-600 mb-2">{webcamError}</div>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleCapture}
                className="px-6 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600"
              >
                사진 촬영
              </button>
              <button
                onClick={handleCloseWebcam}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과 섹션 */}
      {!isLoading && profileImg && (
        <div className="flex w-full justify-between mt-6 space-x-6">
          {/* 닮은 연예인 */}
          <div className="flex flex-col items-center w-[47%] aspect-square bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            {celebrityName ? (
              <>
                <img
                  src={`/assets/celeb/${celebrityName}.jpg`}
                  alt="닮은 연예인"
                  className="max-w-full max-h-full object-contain aspect-square"
                  style={{ aspectRatio: '1 / 1' }}
                />
                <div className="mt-2 text-sm font-semibold text-gray-800">
                  {celebrityName}
                </div>
              </>
            ) : (
              <span className="text-gray-500">닮은 연예인</span>
            )}
          </div>

          {/* 동물상 */}
          <div className="flex flex-col items-center w-[47%] aspect-square bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            {animalName ? (
              <>
                <img
                  src={`/assets/animals/${animalName}.jpg`}
                  alt="동물상"
                  className="max-w-full max-h-full object-contain aspect-square"
                  style={{ aspectRatio: '1 / 1' }}
                />
                <div className="mt-2 text-sm font-semibold text-gray-800">
                  {animalName}
                </div>
              </>
            ) : (
              <span className="text-gray-500">동물상</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
