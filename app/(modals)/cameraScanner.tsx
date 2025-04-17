import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, Dimensions, Image } from 'react-native';
import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Icons from 'phosphor-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import ScreenWrapper from '@/components/ScreenWrapper';
import { uploadFileToCloudinary } from '@/service/ImageService';
import { useReceiptProcessing } from '@/hooks/useReceiptProcessing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.85;

const CameraScanner = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flash, setFlash] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoTaken, setPhotoTaken] = useState(false);  // Track if photo is taken
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const { isProcessing, receiptData } = useReceiptProcessing(photo);
  const [showPreview, setShowPreview] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      setPhoto(photo.uri);
      setShowPreview(true); // Show preview immediately after capture
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const uploadResult = await uploadFileToCloudinary(
        { uri: photo!, type: 'image/jpeg' },
        'Receipt Photos'
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.msg);
      }

      router.push({
        pathname: '/AutoTransaction',
        params: {
          imageUrl: uploadResult.data.url,
        }
      });
    } catch (error) {
      console.error('Error uploading picture:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setPhoto(null);
    setShowPreview(false);
    setIsLoading(false);
  };

  if (!permission) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.scanText}>Requesting camera permission...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Icons.Camera size={64} color={colors.neutral400} />
          <Text style={styles.scanText}>Camera access is required</Text>
          <Text style={styles.scanText}>Please enable camera permissions in your device settings to use this feature.</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>Grant Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {!showPreview ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            enableTorch={flash}
            exposure={0.3} // Increase brightness
          >
            <View style={styles.overlay}>
              <Animated.View 
                entering={FadeIn.duration(500)}
                style={styles.scanArea}
              >
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </Animated.View>

              <Animated.Text 
                entering={FadeIn.duration(500).delay(300)}
                style={styles.scanText}
              >
                Position the receipt within the frame
              </Animated.Text>
            </View>
            
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => setFlash(!flash)}
              >
                <Icons.Flashlight
                  size={24}
                  color={colors.white}
                  weight={flash ? "fill" : "regular"}
                />
              </TouchableOpacity>

              {!photoTaken && (
                <TouchableOpacity 
                  style={[styles.controlButton, styles.captureButton]}
                  onPress={takePicture}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              >
                <Icons.CameraRotate size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: photo! }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <View style={styles.previewOverlay}>
              <View style={styles.previewControls}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Processing receipt...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity 
                      style={[styles.button, styles.buttonSecondary]}
                      onPress={handleRetry}
                    >
                      <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                        Retake
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.buttonPrimary]}
                      onPress={handleConfirm}
                    >
                      <Text style={styles.buttonText}>
                        Use Photo
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default CameraScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  camera: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE * 1.4, // Make it taller for receipt
    backgroundColor: 'transparent',
    borderRadius: 16,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primary,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primary,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primary,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primary,
    borderBottomRightRadius: 16,
  },
  scanText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: scale(20),
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
  },
  resultText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '45%',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.neutral800,
  },
  buttonText: {
    textAlign: 'center',
    color: colors.white,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: colors.neutral400,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  previewControls: {
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
});

