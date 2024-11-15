import { FirebaseError } from 'firebase/app';

export function handleFirebaseError(error: unknown): string {
    if (error instanceof FirebaseError) {
        switch (error.code) {
            // Authentication errors
            case 'auth/user-not-found':
                return 'No user found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-email':
                return 'The email address is invalid.';
            case 'auth/user-disabled':
                return 'This user account has been disabled.';
            case 'auth/email-already-in-use':
                return 'An account already exists with this email address.';
            case 'auth/weak-password':
                return 'The password is too weak. Please use a stronger password.';
            case 'auth/requires-recent-login':
                return 'This operation is sensitive and requires recent authentication. Log in again before retrying.';

            // Firestore errors
            case 'permission-denied':
                return 'You do not have permission to perform this operation.';
            case 'not-found':
                return 'The requested document was not found.';

            // Storage errors
            case 'storage/object-not-found':
                return 'The file does not exist.';
            case 'storage/unauthorized':
                return 'You do not have permission to access this file.';
            case 'storage/canceled':
                return 'The file upload was canceled.';

            // Custom app errors
            case 'app/network-error':
                return 'A network error occurred. Please check your connection and try again.';
            case 'app/invalid-input':
                return 'The provided input is invalid. Please check your information and try again.';

            default:
                return error.message || 'An unknown error occurred.';
        }
    } else if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred.';
}