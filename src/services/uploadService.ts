// src/services/uploadService.ts
import axios from 'axios';
import type { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_IMG_SRC_TYPES } from 'react';

// 서버에 업로드 후 반환되는 데이터 형태
export interface UploadResponse {
  user_photo_id: number;
  image_url: string;
  uploaded_at: string;
  facial_area: any;
  facial_confidence: number;   
  embedding: string;
  // 서버에서 닮은 연예인 or 동물 URL을 반환한다면 여기에 추가할 수 있습니다
  // celebrity_url?: string;
  // animal_url?: string;
}

export interface AnimalResponse {
  animal: string;
  animal_confidence: number;
}

export interface CelebrityResponse {
  target_photo_id: number;    // DB상의 PK
  image_url: string;          // 가장 닮은 사진의 경로
  name: string;               // 닮은 객체(사람/동물 등)의 식별 이름
  similarity: number;         // 유사도 (0~1 사이)
  type: string;               // "human" | "animal" 등 분류
  created_at: string;         // 레코드 생성 시각 (ISO 8601)
  embedding_vector: string;   // 원본 벡터 문자열 "[v1,v2,…]"
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * 사용자의 사진을 업로드하고, 처리된 메타정보를 반환합니다.
 * @param file 업로드할 이미지 파일
 * @param userId 현재 로그인한 사용자의 ID
 * @returns UploadResponse 형태의 객체
 */
export async function uploadUserPhoto(
  file: File,
//   userId: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
//   formData.append('meta', JSON.stringify({ userid: userId }));

  const response = await axios.post<{ photo: UploadResponse }>(
    `${BACKEND_URL}/uploaduser`,
    formData,
    {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
    },
      
    }
  );

  const photo = response.data.photo;
  // image_url이 "uploads/..." 형태라면, 절대 경로로 변환
  photo.image_url = `${BACKEND_URL}/${photo.image_url}`;
  console.log("여기",photo);
  return photo;
}

export async function getSimilarAnimal(
  imageUrl: string,
  x: number,
  y: number,
  w: number,
  h: DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_IMG_SRC_TYPES
): Promise<AnimalResponse> {
  try {
    // 서버 API는 image_url을 JSON 본문으로 기대합니다.
    // 따라서 FormData를 사용하는 대신 직접 JSON 객체를 보냅니다.
    const response = await axios.post<AnimalResponse>(
      `${BACKEND_URL}/getsimilaranimal`,
      { 
        image_url: imageUrl,
        x: x,
        y: y,
        w: w,
        h: h
      }, // image_url을 JSON 객체로 보냅니다.
      {
        headers: {
          'Content-Type': 'application/json', // Content-Type을 application/json으로 설정합니다.
        },
      }
    );
    // console.log("facialArea 도착",facialArea);

    return response.data;
  } catch (error) {
    console.error('getSimilarAnimal API 호출 실패:', error);
    // 에러 처리 로직을 추가할 수 있습니다.
    throw error; // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 합니다.
  }
}

export async function getSimilarCelebrity(
   embeddingArray: number[]
): Promise<CelebrityResponse> {
  const response = await axios.post<CelebrityResponse>(
    `${BACKEND_URL}/find_most_similar`,
    {
      embedding_vector: embeddingArray
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log(response.data);
  return response.data;
}