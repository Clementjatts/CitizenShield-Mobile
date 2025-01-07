import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { auth } from '../config/firebaseConfig';

export const useUnreadMessages = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('recipientId', '==', user.uid),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.docs.length);
        }, (error) => {
            console.error('Error fetching unread messages:', error);
        });

        return () => unsubscribe();
    }, []);

    return unreadCount;
};
