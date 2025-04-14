import WelcomeScreen from "./Screens/WelcomeScreen";
import LoginScreen from "./Screens/LoginScreen";
import SignUpScreen from "./Screens/SignUpScreen";
import PasswordRecoveryScreen from "./Screens/PasswordRecoveryScreen";
import VerificationScreen from "./Screens/VerificationScreen";
import SuccessScreen from "./Screens/SuccessScreen";
import CreateNewPasswordScreen from "./Screens/CreateNewPassword";
import MessagesScreen from "./Screens/MessageScreen";
import ContactsScreen from "./Screens/ContactsScreen";
import CreatePasswordScreen from "./Screens/CreatePassword";
import FillName from "./Screens/FillNameScreen";
import PersonalInfoScreen from "./Screens/PersonalInfo";
import UpdateAvatar from "./Screens/UploadAvatarScreen";
import ProfileScreen from "./Screens/ProfileScreen";
import EditProfileScreen from "./Screens/EditProfileScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import UpdatePasswordScreen from "./Screens/UpdatePasswordScreen";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider } from "./context/AuthContext"


const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UpdatePasswordScreen"
          component={UpdatePasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="PasswordRecovery"
          component={PasswordRecoveryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Verification"
          component={VerificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateNewPassword"
          component={CreateNewPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MessagesScreen"
          component={MessagesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactsScreen"
          component={ContactsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreatePasswordScreen"
          component={CreatePasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FillName"
          component={FillName}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UploadAvt"
          component={UpdateAvatar}
          options={{ headerShown: false }}
        />
       
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
  );
}
