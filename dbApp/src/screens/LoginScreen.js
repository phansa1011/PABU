import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import CustomButton from "../component/CustomButton";
import SearchBox from "../component/SearchBox";
import { MaterialIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [input, setInput] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {    
            // ตรวจสอบว่าข้อมูลที่กรอกเป็น username, email หรือ phone
            let identifier = input;

            if (input.includes('@')) {
                identifier = 'email';
            } else if (/\d{10}/.test(input)) {
                identifier = 'phone';
            } else {
                identifier = 'username';
            }

            // คุณสามารถทำการเชื่อมต่อกับ backend หรือ API ที่ต้องการได้
            // const token = await loginUser(identifier, password);

            navigation.navigate("Parking", {  
                identifier: input  // ส่งข้อมูลไปยังหน้าถัดไป
            });

            Alert.alert("Login Successful", `Welcome back!`);
        } catch (error) {
            Alert.alert("Login Failed", error.message);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior="padding"
        >
            <View style={styles.header}>
                <MaterialIcons name="login" size={40} color="white" />
                <Text style={styles.title}>Welcome Back</Text>
            </View>

            <SearchBox 
                placeHolder="Username/Email/Phone Number" 
                value={input} 
                onChangeText={setInput}
                containerStyle={styles.input}
            />
            
            <SearchBox 
                placeHolder="Password"
                secure={true}
                value={password}
                onChangeText={setPassword}
                containerStyle={styles.input}
            />
            
            <CustomButton 
                title="Log In"
                backgroundColor="#FFFFFF"
                textColor="#B19CD8"
                fontSize={18}
                width="100%"
                borderRadius={15}
                marginTop={20}
                onPress={handleLogin}
            />

            <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={styles.registerText}>
                    Don't have an account? <Text style={styles.registerHighlight}>Sign Up</Text>
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: '#B19CD8',
        padding: 25,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 15,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
    },
    registerLink: {
        marginTop: 25,
        alignItems: 'center',
    },
    registerText: {
        color: 'white',
        fontSize: 16,
    },
    registerHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;