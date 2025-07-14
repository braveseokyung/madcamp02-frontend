import React from 'react';

// 1. props 타입 정의
interface ProfileModalProps {
  onClose: () => void;
  profileImg: string | null;
  handleProfileImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 2. 컴포넌트에 타입 적용
const ProfileModal: React.FC<ProfileModalProps> = ({
  onClose,
  profileImg,
  handleProfileImgChange,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          minWidth: 640,
          minHeight: 400,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: '#3d2fd1',
                marginBottom: 16,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="프로필"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfileImgChange}
            />
          </label>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            닉네임
          </div>
          <div style={{ color: '#666' }}>이메일 등 추가 정보</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
