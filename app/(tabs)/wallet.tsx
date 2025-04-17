import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Typo from '@/components/Typo'
import * as Icons from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { useAuth } from '@/contexts/authContext'
import { orderBy, where } from 'firebase/firestore'
import Loading from '@/components/loading'
import WalletListItem from '@/components/WalletListItem'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '@/contexts/themeContext'

const Wallet = () => {
  const router = useRouter()
  const { user } = useAuth(); 
  const { themeColors } = useTheme();

  const { data: wallet, error, loading } = useFetchData<WalletType>('Wallets', [
    where('uid', '==', user?.uid), 
    orderBy('created', 'desc'),
  ]);

  const getTotalBalance = () => {
    return wallet?.reduce((sum, walletItem) => sum + (walletItem.amount || 0), 0) || 0;
  };

  const renderItem = ({ item }: { item: WalletType }) => (
    <Animated.View entering={FadeInDown.springify()}>
      <WalletListItem 
        wallet={item} 
        onPress={() => {
          // Handle wallet item press - you can navigate to wallet details here
          console.log('Wallet pressed:', item.id);
        }}
      />
    </Animated.View>
  );

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      <View style={styles.container}>
        <View style={[styles.balanceView, { backgroundColor: themeColors.background }]}>
          <Typo size={54} fontWeight={'500'} color={themeColors.text}> 
            ${getTotalBalance().toFixed(2)}
          </Typo>
          <Typo size={16} color={themeColors.textSecondary}> 
            Total Balance
          </Typo>
        </View>

        <View style={[styles.wallets, { backgroundColor: themeColors.surface }]}>
          <View style={styles.flexRow}>
            <Typo size={20} fontWeight={'500'} color={themeColors.text}>My Wallets</Typo>
            <TouchableOpacity onPress={() => router.push('/(modals)/WalletModal')}>
              <Icons.PlusCircle weight='fill' color={themeColors.primary} size={verticalScale(33)} />
            </TouchableOpacity>
          </View>

          {loading && <Loading />}
          {error && <Typo size={16} color={colors.rose}>{error}</Typo>}
          
          {!loading && !error && (
            <Animated.FlatList
              data={wallet}
              renderItem={renderItem}
              keyExtractor={(item) => item.id || ''}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <Typo size={16} color={themeColors.textSecondary}>
                  No wallets found.
                </Typo>
              )}
            />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  }, 
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingY._20,
    paddingTop: spacingX._25,
  },
  listContent: {
    paddingTop: spacingY._10,
  }
});
