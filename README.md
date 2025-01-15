# CitizenShield-Mobile

**Description**:  
CitizenShield-Mobile is a React Native mobile application designed to enhance community safety and emergency response. It integrates with the CitizenShield Admin Dashboard for efficient emergency management.

**Features**:
- **SOS Alerts**: Quickly send distress signals to emergency contacts and services.
- **Emergency Services Integration**: Seamlessly connect with local emergency services.
- **Incident Mapping**: Visualize incidents on a map for better situational awareness.
- **Community Forums**: Engage with the community through forums to share information and updates.
- **Real-time Notifications**: Receive instant alerts about emergencies in your area.
- **User Authentication**: Secure login and registration system with Firebase.
- **Profile Management**: Manage personal information and emergency contacts.
- **Offline Support**: Basic functionality available without internet connection.
- **Location Services**: Real-time location tracking and geofencing capabilities.
- **Image Upload**: Support for image uploads in incident reports.

**Project Structure**:
```
frontend/
├── app/                 # Main application screens and navigation using Expo Router
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable UI components
├── config/             # Configuration files
├── constants/          # App constants and theme
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── __tests__/          # Test files
```

**Prerequisites**:
- Node.js (v16 or higher)
- npm (v8 or higher) or yarn (v1.22 or higher)
- Expo CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

**Tech Stack**:
- React Native (v0.76.2)
- Expo SDK 52
- Firebase 10.14.1
- TypeScript 5.3.3
- React Navigation 7.0
- React Native Maps 1.18.0
- Expo Router 4.0.6

**Installation**:
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CitizenShield-Mobile.git
   ```
2. Navigate to the project directory:
   ```bash
   cd CitizenShield-Mobile/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

**Development Workflow**:
1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
2. Choose your platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

**Available Scripts**:
```bash
npm start          # Start the Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web browser
npm test          # Run tests
npm run lint      # Run ESLint
```

**Configuration**:
1. Firebase Setup:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Add your Firebase configuration in `config/firebaseConfig.ts`
   ```typescript
   export const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     // ...other config
   };
   ```

2. Environment Variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   API_URL=your-api-url
   FIREBASE_API_KEY=your-firebase-api-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

**Testing**:
The project uses Jest and React Native Testing Library for testing:
```bash
npm test          # Run tests in watch mode
```

**Building for Production**:
1. For Android:
   ```bash
   eas build -p android
   ```
2. For iOS:
   ```bash
   eas build -p ios
   ```

**Troubleshooting**:
- Clear Metro bundler cache:
  ```bash
  npm start --reset-cache
  ```
- For iOS build issues:
  ```bash
  cd ios && pod install && cd ..
  ```
- For Android build issues:
  ```bash
  cd android && ./gradlew clean && cd ..
  ```

**Contributing**:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Code Style**:
- Follow the ESLint configuration
- Use TypeScript for type safety
- Follow React Native best practices
- Write unit tests for new features

**License**:
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Contact**:
- For any inquiries or support, please contact [support@citizenshield.com]
- Report issues on our [GitHub Issues](https://github.com/yourusername/CitizenShield-Mobile/issues) page

**Acknowledgments**:
- Thanks to all contributors who have helped shape CitizenShield
- Special thanks to the open-source community for the tools and libraries used in this project

_Last updated: January 15, 2025_
