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

const Login = () => {
    const emailRef = useRef<string>("");
    const passwordRef = useRef<string>("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const {login: loginUser} = useAuth()

    const handleSubmit = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Login', 'Please fill all the fields');
            return;
        }
        setIsLoading(true);
        const res = await loginUser(emailRef.current, passwordRef.current);
        setIsLoading(false);
        if (!res.success){
            Alert.alert('login' , res.msg)
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
                        Hey,
                    </Typo>
                    <Typo size={32} fontWeight={'800'}>
                        Welcome Back
                    </Typo>
                </Animated.View>

                {/* Form */}
                <Animated.View 
                    entering={FadeInDown.duration(700).springify()}
                    style={styles.form}
                >
                    <Typo size={16} color={colors.textLighter} style={styles.subtitle}>
                        Login now to track all your expenses
                    </Typo>
                    
                    <View style={styles.inputsContainer}>
                        <Input
                            onChangeText={(value) => (emailRef.current = value)}
                            placeholder="Enter your email"
                            icon={<icon.At size={verticalScale(24)} color={colors.neutral400} weight="fill" />}
                            containerStyle={styles.input}
                        />
                        <Input
                            onChangeText={(value) => (passwordRef.current = value)}
                            placeholder="Enter your password"
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
                    </View>
                </Animated.View>

                <Animated.View 
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.actionContainer}
                >
                    {/* Forgot password */}
                    <Pressable>
                        <Typo size={14} color={colors.primary} style={styles.forgotPassword}>
                            Forgot Password?
                        </Typo>
                    </Pressable>

                    {/* Login Button */}
                    <Button loading={isLoading} onPress={handleSubmit} style={styles.button}>
                        <Typo fontWeight={'700'} color={colors.black} size={20}>
                            Login
                        </Typo>
                    </Button>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Typo size={15} color={colors.textLighter}> Don't have an account? </Typo>
                        <Pressable onPress={() => router.push("/(auth)/register")}>
                            <Typo size={15} fontWeight={'700'} color={colors.primary}>
                                Sign Up
                            </Typo>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};

export default Login;

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
    forgotPassword: {
        textAlign: 'right',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginTop: spacingY._10,
    },
});
