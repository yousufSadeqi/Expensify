import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import ModalWrapper from '@/components/ModalWrapper';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { Image } from 'expo-image';
import { getProfileImage } from '@/service/ImageService';
import * as Icons from 'phosphor-react-native';
import Typo from '@/components/Typo';
import Input from '@/components/input';
import { UserDataType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { updateUser } from '@/service/userService';

const ProfileModal = () => {
  const { user, updateUserData } = useAuth();

  const [userData, setUserData] = useState<UserDataType>({
    name: '', // Ensure name is initialized as an empty string
    image: null, // Start with no image
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setUserData({
      name: user?.name || '', // Default to empty string if name is undefined
      image: user?.image || null,
    });
  }, [user]);

 
  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setUserData({ ...userData, image: result.assets[0].uri }); // ✅ Only store the URI
    }
  };

  const onSubmit = async () => {
    let { name, image } = userData;

    // Check if name is empty before proceeding
    if (!name || !name.trim()) {
      Alert.alert('User', 'Please fill all the fields');
      return;
    }

    setLoading(true);

    
    try {
      const res = await updateUser(user?.uid as string, userData);
      setLoading(false);
      console.log(res)
      if (res.success) {
        updateUserData(user?.uid as string);
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      } else {
        Alert.alert('Hey ' + user?.name, res.msg);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title="Update Profile" leftIcon={<BackButton />} style={{ marginBottom: spacingY._10 }} />

        {/* Form */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={userData.image ? { uri: userData.image } : getProfileImage(null)} // ✅ Ensure valid image source
              contentFit="cover"
              transition={100}
            />

            <TouchableOpacity onPress={onPickImage} style={styles.editIcon}>
              <Icons.Pencil size={verticalScale(20)} color={colors.neutral800} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}> Name</Typo>
            <Input
              placeholder="Name"
              value={userData.name}
              onChangeText={(value) => setUserData({ ...userData, name: value })}
            />
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Button onPress={onSubmit} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={'700'}> Update </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingY._20,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(20),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  editIcon: {
    position: 'absolute',
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
