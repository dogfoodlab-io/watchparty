// Fixed: Added React import to provide the React namespace for type definitions
import React from 'react';

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: number; // in seconds
  color: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}
