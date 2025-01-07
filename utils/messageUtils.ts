import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

export const markMessagesAsRead = async (conversationId?: string) => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const messagesRef = collection(db, 'messages');
        let q = query(
            messagesRef,
            where('recipientId', '==', user.uid),
            where('read', '==', false)
        );

        // If conversationId is provided, only mark messages from that conversation as read
        if (conversationId) {
            q = query(
                messagesRef,
                where('recipientId', '==', user.uid),
                where('conversationId', '==', conversationId),
                where('read', '==', false)
            );
        }

        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};
