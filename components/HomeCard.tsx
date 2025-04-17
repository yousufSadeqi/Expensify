import { StyleSheet, View } from 'react-native'
import React from 'react'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Typo from './Typo'
import * as Icons from 'phosphor-react-native'
import { formatCurrency } from '@/utils/currency'
import { useAuth } from '@/contexts/authContext'
import { WalletType } from '@/types'
import useFetchData from '@/hooks/useFetchData'
import { where } from 'firebase/firestore'
import { useTheme } from '@/contexts/themeContext'

const HomeCard = () => {
  const { user } = useAuth();
  const { themeColors } = useTheme();
  const { data: wallets } = useFetchData<WalletType>('Wallets', [
    where('uid', '==', user?.uid),
  ]);

  const getTotals = () => {
    if (!wallets?.length) return { balance: 0, income: 0, expense: 0 };
    return wallets.reduce((totals, wallet) => ({
      balance: totals.balance + (wallet.amount || 0),
      income: totals.income + (wallet.totalIncome || 0),
      expense: totals.expense + (wallet.totalExpenses || 0)
    }), { balance: 0, income: 0, expense: 0 });
  };

  const totals = getTotals();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <Typo color={themeColors.textSecondary} size={15}>
          Total Balance
        </Typo>
        <Typo color={themeColors.text} size={32} fontWeight={'700'}>
          {formatCurrency(totals.balance)}
        </Typo>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        {/* Income */}
        <View style={styles.statItem}>
          <Icons.ArrowDown 
            size={20}
            color={colors.green}
            weight='bold'
          />
          <View>
            <Typo size={14} color={themeColors.textSecondary}>Income</Typo>
            <Typo size={16} color={colors.green} fontWeight={'600'}>
              {formatCurrency(totals.income)}
            </Typo>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: themeColors.surfaceVariant }]} />

        {/* Expenses */}
        <View style={styles.statItem}>
          <Icons.ArrowUp
            size={20}
            color={colors.rose}
            weight='bold'
          />
          <View>
            <Typo size={14} color={themeColors.textSecondary}>Expenses</Typo>
            <Typo size={16} color={colors.rose} fontWeight={'600'}>
              {formatCurrency(totals.expense)}
            </Typo>
          </View>
        </View>
      </View>
    </View>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  container: {
    borderRadius: radius._20,
    padding: spacingY._20,
  },
  balanceSection: {
    alignItems: 'center',
    gap: spacingY._5,
    paddingBottom: spacingY._20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacingY._10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  divider: {
    width: 1,
    height: '100%',
    opacity: 0.5,
  }
});