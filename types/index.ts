import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Article {
    id: string;
    title: string;
    author: string;
    date: string;
    snippet: string;
    content?: string;
    imageUrl?: string;
}

export interface ForumPost {
    id: string;
    title: string;
    author: string;
    content?: string;
    date: string;
    replies: number;
    likes: number;
    authorId?: string;
}

export interface Message {
    id: string;
    sender: string;
    preview: string;
    timestamp: string;
    unread: boolean;
    content?: string;
}

export interface ChatDocument {
    participants: string[];
    lastMessage: string;
    lastMessageTimestamp: Timestamp | FieldValue;
    unread: boolean;
}

export interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string | null;
}