import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import CustomButton from "../component/CustomButton";
import SearchBox from "../component/SearchBox";
import { MaterialIcons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [carPlate, setCarPlate] = useState("");

    const handleRegister = async () => {
        try {
            // Basic validation
            if (!username || !password || !confirmPassword || !carPlate) {
                Alert.alert("Error", "Please fill in all fields");
                return;
            }

            if (password !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return;
            }

            // await registerUser(username, password, carPlate);
            Alert.alert("Registration Successful");
            navigation.navigate("Login");
        } catch (error) {
            Alert.alert("Register Failed", error.message);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior="padding"
        >
            <View style={styles.header}>
                <MaterialIcons name="person-add" size={40} color="white" />
                <Text style={styles.title}>Create Account</Text>
            </View>

            <View style={styles.formContainer}>
                <SearchBox
                    placeHolder="Username"
                    value={username}
                    onChangeText={setUsername}
                    containerStyle={styles.input}
                />
                
                <SearchBox
                    placeHolder="Email"
                    value={email}
                    onChangeText={setEmail}
                    containerStyle={styles.input}
                />
                
                <SearchBox
                    placeHolder="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    containerStyle={styles.input}
                />

                <SearchBox
                    placeHolder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secure={true}
                    containerStyle={styles.input}
                />
                
                <SearchBox
                    placeHolder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secure={true}
                    containerStyle={styles.input}
                />
                
                <SearchBox
                    placeHolder="Car Plate"
                    value={carPlate}
                    onChangeText={setCarPlate}
                    containerStyle={styles.input}
                    autoCapitalize="characters"
                />

                <CustomButton 
                    title="Register Now"
                    backgroundColor="#FFFFFF"
                    textColor="#B19CD8"
                    fontSize={18}
                    width="100%"
                    borderRadius={15}
                    marginTop={30}
                    onPress={handleRegister}
                />

                <TouchableOpacity 
                    style={styles.loginLink}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
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
    },
    loginLink: {
        marginTop: 25,
        alignItems: 'center',
    },
    loginText: {
        color: 'white',
        fontSize: 16,
    },
    loginHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;