import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, spacingX, spacingY } from '@/constants/theme';
import HomeCard from '@/components/HomeCard';
import { useAuth } from '@/contexts/authContext';
import useFetchData from '@/hooks/useFetchData';
import { TransactionType, WalletType } from '@/types';
import { limit, orderBy, where } from 'firebase/firestore';
import ScreenWrapper from '@/components/ScreenWrapper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Loading from '@/components/loading';
import Typo from '@/components/Typo';
import { verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native';
import TransactionList from '@/components/TransactionList';
import { useTheme } from '@/contexts/themeContext';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const Index = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme, themeColors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0); // <- Segment state

  if (!user) {
    router.replace('/welcome');
    return null;
  }

  const { data: wallets, loading } = useFetchData<WalletType>('Wallets', [
    where('uid', '==', user.uid),
  ]);

  const transactionConstraints = [
    where('uid', '==', user.uid),
    orderBy('date', 'desc'),
    limit(30),
  ];

  const {
    data: recentTransaction,
    loading: transactionLoading,
  } = useFetchData<TransactionType>('transactions', transactionConstraints);

  const getTotalBalance = () =>
    wallets?.reduce((sum, wallet) => sum + (wallet.amount || 0), 0) || 0;

  const getTotalIncome = () =>
    wallets?.reduce((sum, wallet) => (wallet.amount && wallet.amount > 0 ? sum + wallet.amount : sum), 0) || 0;

  const getTotalExpenses = () =>
    wallets?.reduce((sum, wallet) => (wallet.amount && wallet.amount < 0 ? sum - Math.abs(wallet.amount) : sum), 0) || 0;

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSegmentChange = (event: any) => {
    setActiveIndex(event.nativeEvent.selectedSegmentIndex);
  };

  const filteredTransactions = () => {
    if (!recentTransaction) return [];
    if (activeIndex === 1) {
      return recentTransaction.filter((item) => item.type == 'income'); // Income
    }
    if (activeIndex === 2) {
      return recentTransaction.filter((item) => item.type == 'expense'); // Expense
    }
    return recentTransaction; // All
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.textSecondary }]}>
          <View style={styles.greetingContainer}>
            <Typo size={16} color={themeColors.textSecondary}>Welcome back,</Typo>
            <Typo size={24} fontWeight={'600'} color={themeColors.text}>{user?.name}</Typo>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.themeToggle, { backgroundColor: themeColors.surface }]} 
              onPress={toggleTheme}
            >
              <Icons.Sun
                size={verticalScale(22)}
                color={themeColors.textSecondary}
                weight={isDarkMode ? "regular" : "bold"}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.searchIcon, { backgroundColor: themeColors.surface }]} 
              onPress={() => router.push('/(modals)/searchModal')}
            >
              <Icons.MagnifyingGlass
                size={verticalScale(22)}
                color={themeColors.textSecondary}
                weight="bold"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scroll Content */}
        <ScrollView 
          style={styles.scrollViewStyle} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <Loading />
          ) : (
            <Animated.View 
              entering={FadeInDown.duration(500)} 
              style={styles.content}
            >
              <HomeCard />
            </Animated.View>
          )}

          {/* Segmented Control */}
          <View style={{ paddingHorizontal: spacingX._20, marginTop: spacingY._20, marginBottom: spacingY._15}}>
            <SegmentedControl
              values={['All', 'Income', 'Expense']}
              selectedIndex={activeIndex}
              onChange={handleSegmentChange}
              tintColor={themeColors.neutral200}
              appearance={isDarkMode ? 'dark' : 'light'}
            />
          </View>

          {/* Recent Transactions */}
          <TransactionList
            data={filteredTransactions()}
            loading={transactionLoading}
            emptyListMessage="No Transactions found"
          />
        </ScrollView>

        {/* Floating Action Menu */}
        {menuOpen && (
          <View style={styles.actionMenu}>
            <Animated.View entering={FadeInDown.duration(300).delay(100)}>
              <TouchableOpacity
                style={[styles.optionButton, styles.optionButtonFirst]}
                onPress={() => {
                  toggleMenu();
                  router.push('/(modals)/transactionModal');
                }}
              >
                <Icons.PencilSimple size={24} weight="bold" color={colors.black} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(300).delay(200)}>
              <TouchableOpacity
                style={[styles.optionButton, styles.optionButtonSecond ]}
                onPress={() => {
                  toggleMenu();
                  router.push('/(modals)/cameraScanner');
                }}
              >
                <Icons.Camera size={24} weight="bold" color={colors.black}  />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Main Floating Button */}
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={toggleMenu}
        >
          <Icons.Plus
            color={colors.black}
            weight="bold"
            size={verticalScale(24)}
          />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  greetingContainer: {
    gap: 4,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    backgroundColor: colors.neutral800,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral700,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacingX._12,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._12,
    borderRadius: 50,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollViewStyle: {
    flex: 1,
    paddingBottom: verticalScale(100),
  },
  scrollContent: {
    paddingTop: spacingY._10,
  },
  content: {
    padding: spacingX._20,
    gap: spacingY._20,
  },
  floatingButton: {
    height: verticalScale(56),
    width: verticalScale(56),
    borderRadius: 28,
    position: 'absolute',
    bottom: verticalScale(30),
    right: verticalScale(30),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionMenu: {
    position: 'absolute',
    bottom: verticalScale(100),
    right: verticalScale(30),
    gap: verticalScale(12),
  },
  optionButton: {
    height: verticalScale(48),
    width: verticalScale(48),
    borderRadius: 24,
    backgroundColor: colors.primary ,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionButtonFirst: {
    backgroundColor: colors.primary,
  },
  optionButtonSecond: {
    backgroundColor: colors.primary,
  },
  themeToggle: {
    padding: spacingX._12,
    borderRadius: 50,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
