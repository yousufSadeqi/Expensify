import { StyleSheet, View, ScrollView, Alert, Text, ViewStyle, Pressable, Platform, TouchableOpacity } from 'react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import ModalWrapper from '@/components/ModalWrapper';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import Typo from '@/components/Typo';
import Input from '@/components/input';
import { TransactionType, WalletType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '@/components/ImageUpload';
import CustomAlert from '@/components/CustomAlert';
import Animated, { FadeIn, FadeOut, FadeInDown, Layout } from 'react-native-reanimated';
import * as Icons from 'phosphor-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { expenseCategories, incomeCategory, transactionTypes } from '@/constants/data';
import useFetchData from '@/hooks/useFetchData';
import { where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { createOrUpdateTransaction, deleteTransaction } from '@/service/transactionService';

type CategoryOption = {
  label: string;
  value: string;
  icon: () => JSX.Element;
};

type paramType = {
  id: string,
  type: string,
  amount: string,
  category: string,
  date: string,
  description: string,
  image: any,
  uid: string,
  walletId: string
};

const TransactionModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const existTransaction: paramType = useLocalSearchParams();
  const [isExistingTransaction, setIsExistingTransaction] = useState(false);

  // Fetch wallets
  const { data: wallets } = useFetchData<WalletType>('Wallets', [
    where('uid', '==', user?.uid),
  ]);

  const [transaction, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    date: new Date(),
    walletId: '', 
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Convert wallets to dropdown format
  const walletOptions = useMemo(() => 
    wallets?.map(wallet => ({
      label: `${wallet.name} ($${wallet.amount || 0})`,
      value: wallet.id || '',
    })) || [], 
    [wallets]
  );

  // Get categories based on transaction type
  const categoryOptions = useMemo(() => {
    if (transaction.type === 'income') {
      return [{
        label: incomeCategory.label,
        value: incomeCategory.value,
        icon: () => (
          <incomeCategory.icon
            size={20}
            color={colors.white}
            weight="bold"
          />
        ),
      }];
    }

    return Object.entries(expenseCategories).map(([key, category]) => ({
      label: category.label,
      value: key,
      icon: () => (
        <category.icon
          size={20}
          color={colors.white}
          weight="bold"
        />
      ),
    }));
  }, [transaction.type]);

  const onPickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setTransaction(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleImageClear = () => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setTransaction(prev => ({ ...prev, image: null })) }
    ]);
  };

  useEffect(() => {
    console.log('Transaction ID:', existTransaction.id);
    if (existTransaction.id) {
      setIsExistingTransaction(true);
      setTransaction({
        id: existTransaction.id,
        type: existTransaction.type,
        amount: Number(existTransaction.amount),
        description: existTransaction.description || '',
        category: existTransaction.category,
        date: new Date(existTransaction.date),
        walletId: existTransaction.walletId,
        image: existTransaction.image || null,
      });
    }
  }, []);

  const handleSaveTransaction = async () => {
    const {type, amount, description, category, date, walletId, image} = transaction;

    if (!amount || !description || !category || !walletId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const transactionData: TransactionType = {
        ...(isExistingTransaction && { id: existTransaction.id }),
        type, 
        amount, 
        description,
        category,
        date,
        uid: user.uid,
        walletId,
        image,
      };

      const res = await createOrUpdateTransaction(transactionData);
      if (res.success) {
        router.back();
      } else {
        Alert.alert('Error', res.msg || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = () => {
    if (!existTransaction.id) {
      return;
    }

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await deleteTransaction(existTransaction.id);
              if (res.success) {
                Alert.alert('Success', 'Transaction deleted successfully');
                router.back();
              } else {
                Alert.alert('Error', res.msg || 'Failed to delete transaction');
              }
            } catch (error) {
              console.error('Delete transaction error:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderHeaderRight = () => {
    if (!existTransaction.id) return null;

    return (
      <TouchableOpacity
        onPress={handleDeleteTransaction}
        style={styles.deleteButton}
        disabled={loading}
      >
        <Icons.Trash size={24} color={colors.rose} weight="bold" />
      </TouchableOpacity>
    );
  };

  const renderDropdownIcon = () => (
    <Icons.CaretDown size={20} color={colors.neutral300} weight="bold" />
  );

  const renderLeftIcon = (visible?: boolean) => {
    const selectedCategory = categoryOptions.find(cat => cat.value === transaction.category);
    return selectedCategory?.icon?.() || null;
  };

  const renderItem = (item: any) => {
    return (
      <View style={styles.dropdownItem}>
        {item.icon && (
          <View style={styles.dropdownIconContainer}>
            {item.icon()}
          </View>
        )}
        <Text style={styles.dropItemText}>{item.label}</Text>
      </View>
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTransaction(prev => ({ ...prev, date: selectedDate }));
    }
  };

  return (
    <ModalWrapper>
      <Header 
        leftIcon={<BackButton />} 
        title={existTransaction.id ? 'Edit Transaction' : 'Add Transaction'}
        rightIcon={renderHeaderRight()}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.content} entering={FadeIn.duration(500)} layout={Layout.springify()}>
          <View style={styles.form}>
    
            {/* Transaction Type Section */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.sectionTitle}>
                Transaction Type
              </Typo>
              <Dropdown
                data={transactionTypes}
                labelField="label"
                valueField="value"
                value={transaction.type}
                onChange={item => setTransaction(prev => ({ ...prev, type: item.value, category: '' }))}
                placeholder="Select Type"
                style={styles.highlightedDropContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropItemText}
                containerStyle={styles.dropdownListContainer}
                renderRightIcon={renderDropdownIcon}
                renderItem={renderItem}
              />
            </View>

            {/* Amount Section */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.sectionTitle}>
                Amount
              </Typo>
            <Input
                placeholder="Enter amount"
                value={transaction.amount.toString()}
                onChangeText={text => setTransaction(prev => ({ ...prev, amount: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                containerStyle={styles.highlightedInput}
              />
            </View>

            {/* Category Section */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.sectionTitle}>
                Category
              </Typo>
              <Dropdown
                data={categoryOptions}
                labelField="label"
                valueField="value"
              value={transaction.category}
                onChange={item => setTransaction(prev => ({ ...prev, category: item.value }))}
                placeholder="Select Category"
                style={styles.dropContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropItemText}
                containerStyle={styles.dropdownListContainer}
                renderRightIcon={renderDropdownIcon}
                renderLeftIcon={renderLeftIcon}
                renderItem={renderItem}
              />
            </View>

            {/* Wallet Section */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.sectionTitle}>
                Wallet
              </Typo>
              <Dropdown
                data={walletOptions}
                labelField="label"
                valueField="value"
                value={transaction.walletId}
                onChange={item => setTransaction(prev => ({ ...prev, walletId: item.value }))}
                placeholder="Select Wallet"
                style={styles.dropContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropItemText}
                containerStyle={styles.dropdownListContainer}
                renderRightIcon={renderDropdownIcon}
                renderItem={renderItem}
              />
            </View>

            {/* Date picker */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.sectionTitle}>
                Date
              </Typo>
              <Pressable 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.datePickerContent}>
                  <Text style={styles.dateText}>
                    {format(transaction.date as Date, 'MMMM dd, yyyy')}
                  </Text>
                  <Icons.Calendar size={20} color={colors.neutral300} weight="bold" />
                </View>
              </Pressable>
              
              {showDatePicker && (
                <View style={Platform.OS === 'ios' ? styles.iosDatePickerContainer : undefined}>
                  <DateTimePicker
                    value={transaction.date as Date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    themeVariant="dark"
                    textColor={colors.white}
                    style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.iosDatePickerButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.iosDatePickerButtonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Description Section */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.sectionTitle}>
                Description
              </Typo>
            <Input
                placeholder="Enter description"
              value={transaction.description}
              onChangeText={text => setTransaction(prev => ({ ...prev, description: text }))}
                containerStyle={styles.descriptionInput}
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>

            {/* Image Upload Section */}
            <View style={styles.section}>
              <Typo size={14} color={colors.neutral300} style={styles.uploadSectionTitle}>
                Receipt/Document (Optional)
              </Typo>
            <Animated.View entering={FadeInDown.delay(300)}>
            <ImageUpload file={transaction.image} onSelect={onPickImage} onClear={handleImageClear} />
          </Animated.View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View style={styles.footer} entering={FadeInDown.delay(600)}>
        <Button onPress={handleSaveTransaction} loading={loading} style={styles.button}>
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Transaction'}</Text>
        </Button>
      </Animated.View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: { 
    flex: 1, 
    backgroundColor: colors.neutral900 
  },
  content: { 
    padding: 20, 
    gap: 24 
  },
  form: { 
    gap: 20 
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    marginLeft: 4,
  },
  uploadSectionTitle: {
    marginLeft: 4 , 
    marginTop: 60,
  },
  input: { 
    backgroundColor: colors.neutral800, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.neutral700,
    minHeight: verticalScale(54),
    paddingHorizontal: spacingX._15,
  },
  descriptionInput: {
    flexDirection: 'row',
    paddingVertical: 15, 
    minHeight: verticalScale(120),
    alignItems: 'flex-start'
  },
  highlightedInput: { 
    backgroundColor: colors.neutral800, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.neutral600,
    minHeight: verticalScale(54),
    paddingHorizontal: spacingX._15,
  },
  highlightedDropContainer: {
    height: verticalScale(54),
    backgroundColor: colors.neutral800,
    borderWidth: 1,
    borderColor: colors.neutral600,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: { 
    padding: 20, 
    paddingBottom: scale(34), 
    backgroundColor: colors.neutral900, 
    borderTopWidth: 1, 
    borderTopColor: colors.neutral800,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  button: { 
    height: 56, 
    borderRadius: 12, 
    backgroundColor: colors.primary 
  },
  buttonText: { 
    color: colors.neutral900, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  dropContainer: {
    height: verticalScale(54),
    backgroundColor: colors.neutral800,
    borderWidth: 1, 
    borderColor: colors.neutral700,
    paddingHorizontal: spacingX._15, 
    borderRadius: radius._12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropItemText: { 
    color: colors.white,
    fontSize: 16,
    paddingVertical: spacingY._12,
  },
  dropdownSelectedText: {
    color: colors.white, 
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: colors.neutral400,
    fontSize: 16,
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.neutral700,
    marginTop: 5,
    padding: spacingX._5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._10,
    borderRadius: radius._10,
    gap: spacingX._12,
  },
  dropdownIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButton: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.neutral700,
    overflow: 'hidden',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._15,
  },
  dateText: {
    color: colors.white,
    fontSize: 16,
  },
  iosDatePickerContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    overflow: 'hidden',
    marginTop: spacingY._10,
  },
  iosDatePicker: {
    backgroundColor: colors.neutral800,
    height: 200,
  },
  iosDatePickerButton: {
    backgroundColor: colors.neutral700,
    padding: spacingY._12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral600,
  },
  iosDatePickerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },  
  deleteButton: {
    padding: spacingX._10,
    marginRight: -spacingX._5,
  },
});

export default TransactionModal;