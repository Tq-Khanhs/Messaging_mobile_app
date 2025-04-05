import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreatePasswordScreen({ navigation }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isConfirmValid, setIsConfirmValid] = useState(false);

    // Validate password
    useEffect(() => {
        // Check if password contains both letters and numbers
        const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d).+$/.test(newPassword);
        setIsPasswordValid(hasLettersAndNumbers && newPassword.length >= 8);
    }, [newPassword]);

    // Validate confirm password
    useEffect(() => {
        setIsConfirmValid(confirmPassword === newPassword && newPassword !== '');
    }, [confirmPassword, newPassword]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo mật khẩu</Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                    Mật khẩu phải gồm chữ và số.
                </Text>
            </View>

            {/* Password Fields */}
            <View style={styles.formContainer}>
                <View style={styles.inputRow}>
                    <TouchableOpacity
                        style={styles.showButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.showButtonText}>HIỆN</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor="#FFFFFF"
                    />
                    {newPassword.length > 0 && (
                        <View style={styles.validationIcon}>
                            {isPasswordValid ? (
                                <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
                            ) : null}
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor="#FFFFFF"
                    />
                    {confirmPassword.length > 0 && (
                        <View style={styles.validationIcon}>
                            {isConfirmValid ? (
                                <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
                            ) : (
                                <Ionicons name="close-circle" size={24} color="#FF3B30" />
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.divider} />
            </View>

            {/* Update Button */}
            <TouchableOpacity
                style={[
                    styles.updateButton,
                    (!isPasswordValid || !isConfirmValid) ? styles.updateButtonDisabled : {}
                ]}
                disabled={!isPasswordValid || !isConfirmValid}
                onPress={() => navigation.navigate("FillName")}
            >
                <Text style={[
                    styles.updateButtonText,
                    (!isPasswordValid || !isConfirmValid) ? styles.updateButtonTextDisabled : {}
                ]}>
                    TIẾP TỤC
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222222',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    instructionContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    instructionText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    formContainer: {
        paddingHorizontal: 16,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        color: 'white',
        fontSize: 16,
    },
    showButton: {
        padding: 4,
    },
    showButtonText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 8,
    },
    validationIcon: {
        width: 24,
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#0A84FF',
        marginVertical: 8,
    },
    updateButton: {
        backgroundColor: '#0A84FF',
        borderRadius: 25,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 32,
        alignItems: 'center',
    },
    updateButtonDisabled: {
        backgroundColor: '#333333', // Darker gray when disabled
        opacity: 0.7,
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    updateButtonTextDisabled: {
        color: '#8E8E93', // Lighter gray text when disabled
    },
});