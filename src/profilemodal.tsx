import React from 'react';
import { FaUser } from 'react-icons/fa';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileImg: string | null;
  handleProfileImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nickname: string;
  email: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  profileImg,
  handleProfileImgChange,
  nickname,
  email,
}) => {
  if (!open) return null;

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
          aria-label="닫기"
        >
          ✕
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
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
              ) : (
                <FaUser size={55} color="#fff" />
              )}
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfileImgChange}
            />
          </label>

          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 8,
              color: '#333',
            }}
          >
            {nickname}
          </div>
          <div style={{ color: '#666', fontSize: 14 }}>{email}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
