import { Alert, Pressable, StyleSheet, View, TextInput } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import BackButton from '@/components/BackButton';
import { verticalScale } from '@/utils/styling';
import Input from '@/components/input';
import * as icon from 'phosphor-react-native';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/authContext';
import CustomAlert from '@/components/CustomAlert';

const Register = () => {
    const nameRef = useRef<string>("");
    const emailRef = useRef<string>("");
    const passwordRef = useRef<string>("");
    const confirmPasswordRef = useRef<string>("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type?: 'success' | 'error' | 'warning';
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'error'
    });
    const router = useRouter();
    const { register: registerUser } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) errors.push('at least 8 characters');
        if (!hasUpperCase) errors.push('an uppercase letter');
        if (!hasLowerCase) errors.push('a lowercase letter');
        if (!hasNumbers) errors.push('a number');
        if (!hasSpecialChar) errors.push('a special character');

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    const handleSubmit = async () => {
        if (!nameRef.current || !emailRef.current || !passwordRef.current || !confirmPasswordRef.current) {
            setAlert({
                visible: true,
                title: 'Missing Fields',
                message: 'Please fill in all fields to continue.',
                type: 'warning'
            });
            return;
        }

        if (!validateEmail(emailRef.current)) {
            setAlert({
                visible: true,
                title: 'Invalid Email',
                message: 'Please enter a valid email address.',
                type: 'error'
            });
            return;
        }

        const passwordValidation = validatePassword(passwordRef.current);
        if (!passwordValidation.isValid) {
            setAlert({
                visible: true,
                title: 'Weak Password',
                message: `Your password must contain ${passwordValidation.errors.join(', ')}.`,
                type: 'error'
            });
            return;
        }

        if (passwordRef.current !== confirmPasswordRef.current) {
            setAlert({
                visible: true,
                title: 'Password Mismatch',
                message: 'Passwords do not match. Please try again.',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await registerUser(emailRef.current, passwordRef.current, nameRef.current);
            
            if (!res.success) {
                setAlert({
                    visible: true,
                    title: 'Registration Failed',
                    message: res.msg || 'Something went wrong. Please try again.',
                    type: 'error'
                });
            } else {
                setAlert({
                    visible: true,
                    title: 'Success',
                    message: 'Your account has been created successfully! You can now login.',
                    type: 'success'
                });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (error) {
            setAlert({
                visible: true,
                title: 'Error',
                message: 'An unexpected error occurred. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Animated.View entering={FadeInDown.duration(500).springify()}>
                    <BackButton iconSize={28} />
                </Animated.View>

                <Animated.View 
                    entering={FadeInDown.duration(600).springify()} 
                    style={{ gap: 5, marginTop: spacingY._20 }}
                >
                    <Typo size={32} fontWeight={'800'}>
                        Create
                    </Typo>
                    <Typo size={32} fontWeight={'800'}>
                        Account
                    </Typo>
                </Animated.View>

                {/* Form */}
                <Animated.View 
                    entering={FadeInDown.duration(700).springify()}
                    style={styles.form}
                >
                    <Typo size={16} color={colors.textLighter} style={styles.subtitle}>
                        Sign up now to manage your expenses
                    </Typo>
                    
                    <View style={styles.inputsContainer}>
                        <Input
                            onChangeText={(value) => (nameRef.current = value)}
                            placeholder="Enter your full name"
                            icon={<icon.User size={verticalScale(24)} color={colors.neutral400} weight="fill" />}
                            containerStyle={styles.input}
                        />
                        <Input
                            onChangeText={(value) => (emailRef.current = value)}
                            placeholder="Enter your email"
                            icon={<icon.At size={verticalScale(24)} color={colors.neutral400} weight="fill" />}
                            containerStyle={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            onChangeText={(value) => (passwordRef.current = value)}
                            placeholder="Create password"
                            icon={<icon.Lock size={verticalScale(24)} color={colors.neutral400} weight="fill" />}
                            secureTextEntry={!isPasswordVisible}
                            containerStyle={styles.input}
                            rightIcon={
                                <Pressable onPress={() => setIsPasswordVisible(prevState => !prevState)}>
                                    {isPasswordVisible ? 
                                        <icon.Eye size={verticalScale(24)} color={colors.neutral400} /> :
                                        <icon.EyeSlash size={verticalScale(24)} color={colors.neutral400} />
                                    }
                                </Pressable>
                            }
                        />
                        <Input
                            onChangeText={(value) => (confirmPasswordRef.current = value)}
                            placeholder="Confirm password"
                            icon={<icon.LockKey size={verticalScale(24)} color={colors.neutral400} weight="fill" />}
                            secureTextEntry={!isConfirmPasswordVisible}
                            containerStyle={styles.input}
                            rightIcon={
                                <Pressable onPress={() => setIsConfirmPasswordVisible(prevState => !prevState)}>
                                    {isConfirmPasswordVisible ? 
                                        <icon.Eye size={verticalScale(24)} color={colors.neutral400} /> :
                                        <icon.EyeSlash size={verticalScale(24)} color={colors.neutral400} />
                                    }
                                </Pressable>
                            }
                        />
                    </View>
                </Animated.View>

                <Animated.View 
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.actionContainer}
                >
                    {/* Register Button */}
                    <Button loading={isLoading} onPress={handleSubmit} style={styles.button}>
                        <Typo fontWeight={'700'} color={colors.black} size={20}>
                            Create Account
                        </Typo>
                    </Button>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Typo size={15} color={colors.textLighter}>Already have an account? </Typo>
                        <Pressable onPress={() => router.push("/(auth)/login")}>
                            <Typo size={15} fontWeight={'700'} color={colors.primary}>
                                Login
                            </Typo>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>

            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
            />
        </ScreenWrapper>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: spacingX._25,
        paddingTop: spacingY._10,
    },
    form: {
        marginTop: spacingY._30,
    },
    subtitle: {
        marginBottom: spacingY._25,
    },
    inputsContainer: {
        gap: spacingY._15,
    },
    input: {
        backgroundColor: colors.neutral800,
        borderWidth: 0,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionContainer: {
        marginTop: spacingY._25,
        gap: spacingY._20,
    },
    button: {
        height: verticalScale(56),
        borderRadius: radius._12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginTop: spacingY._10,
    },
});
