export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Generation {
  id: string;
  type: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video';
  thumbnail: string;
  timestamp: Date;
  prompt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}