import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Homescreen from "./src/screens/Homescreen";
import ListCard from "./src/component/ParkingSlot";
import RegisterScreen from "./src/screens/RegisterScreen";
import LoginScreen from "./src/screens/LoginScreen";
import CarparkingScreen from "./src/screens/CarparkingScreen";
import ReservationScreen from "./src/screens/ReservationScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import MyParkingScreen from "./src/screens/MyparkingScreen";
const Stack = createStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home"> 
        <Stack.Screen 
        name="Home" 
        component={Homescreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ headerShown: false }}
         />
         <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
        />
         <Stack.Screen 
        name="Parking" 
        component={CarparkingScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="Reservation" 
        component={ReservationScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="Myparking" 
        component={MyParkingScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="ListCard" 
        component={ListCard}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;