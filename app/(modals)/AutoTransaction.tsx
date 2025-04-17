// pages/transactionModal.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReceiptData, analyzeReceipt } from '@/service/ReceiptService';
import { View, ActivityIndicator } from 'react-native';
import Typo from '@/components/Typo';
import ModalWrapper from '@/components/ModalWrapper';
import { useTheme } from '@/contexts/themeContext';
import { StyleSheet } from 'react-native';
import { spacingX, spacingY } from '@/constants/theme';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';

const AutoTransaction = () => {
  const params = useLocalSearchParams();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeReceiptImage = async () => {
      try {
        setLoading(true);
        const imageUrl = params.imageUrl as string;
        if (!imageUrl) {
          throw new Error('No image URL provided');
        }
        
        const data = await analyzeReceipt(imageUrl);
        setReceiptData(data);
      } catch (err) {
        console.error('Error analyzing receipt:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze receipt');
      } finally {
        setLoading(false);
      }
    };

    analyzeReceiptImage();
  }, [params.imageUrl]);

  if (loading) {
    return (
      <ModalWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Typo color={themeColors.text}>Analyzing receipt...</Typo>
        </View>
      </ModalWrapper>
    );
  }

  if (error) {
    return (
      <ModalWrapper>
        <View style={styles.centerContainer}>
          <Typo color={themeColors.rose}>{error}</Typo>
          <Button onPress={() => router.back()}>Try Again</Button>
        </View>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Typo size={18} color={themeColors.text} fontWeight="600">Receipt Details</Typo>
          <View style={styles.details}>
            <Typo color={themeColors.text}>Merchant: {receiptData?.merchantName}</Typo>
            <Typo color={themeColors.text}>Date: {receiptData?.date}</Typo>
            <Typo color={themeColors.text}>Total: ${receiptData?.totalAmount?.toFixed(2)}</Typo>
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Typo size={18} color={themeColors.text} fontWeight="600">Items</Typo>
          {receiptData?.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Typo color={themeColors.text}>{item.name}</Typo>
                <Typo color={themeColors.textSecondary}>x{item.quantity}</Typo>
              </View>
              <Typo color={themeColors.primary}>${item.price?.toFixed(2)}</Typo>
            </View>
          ))}
        </View>

        <Button 
          onPress={() => router.push({
            pathname: '/(modals)/transactionModal',
            params: {
              amount: receiptData?.totalAmount,
              date: receiptData?.date,
              description: receiptData?.merchantName,
            }
          })}
        >
          Create Transaction
        </Button>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacingX._20,
    gap: spacingY._20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacingY._20,
  },
  section: {
    padding: spacingY._15,
    borderRadius: 12,
    gap: spacingY._10,
  },
  details: {
    gap: spacingY._5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacingY._10,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  }
});

export default AutoTransaction;