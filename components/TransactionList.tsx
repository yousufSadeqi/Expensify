import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Typo from './Typo';
import { TransactionItemProps, TransactionListType, TransactionType } from '@/types';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { FlashList } from '@shopify/flash-list';
import { verticalScale } from '@/utils/styling';
import Loading from './loading';
import { expenseCategories, incomeCategory } from '@/constants/data';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import { useTheme } from '@/contexts/themeContext';

// Main Transaction List Component
const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage,
}: TransactionListType) => {
  const { themeColors } = useTheme();
  const router = useRouter();

  const handleClick = (item: TransactionType) => {
    router.push({
      pathname: '/(modals)/transactionModal',
      params: {
        id: item.id,
        type: item.type,
        amount: item.amount,
        category: item.category,
        date: (item.date as Timestamp)?.toDate()?.toISOString(),
        description: item.description,
        image: item.image,
        uid: item.uid,
        walletId: item.walletId 
      }
    });
  };

  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} fontWeight={'500'} color={themeColors.text}>
          {title}
        </Typo>
      )}

      <View>
        <FlashList
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem 
              item={item} 
              index={index} 
              handleClick={handleClick}
              themeColors={themeColors} 
            />
          )}
          estimatedItemSize={200}
        />
      </View>

      {!loading && data.length === 0 && (
        <Typo 
          size={15} 
          color={themeColors.textSecondary} 
          style={{ textAlign: 'center', marginTop: spacingY._15 }}
        >
          {emptyListMessage}
        </Typo>
      )}

      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}
    </View>
  );
};

const TransactionItem = ({ item, index, handleClick, themeColors }: TransactionItemProps) => {
  let category = item?.type === 'income' ? incomeCategory : expenseCategories[item.category!];

  const IconComponent = category?.icon || Icons.CreditCard;

  const date = (item.date as Timestamp)?.toDate()?.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.amount);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(14)}>
      <TouchableOpacity 
        style={[styles.row, { backgroundColor: themeColors.surface }]} 
        onPress={() => handleClick(item)}
      >
        <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
          {IconComponent && (
            <IconComponent size={verticalScale(25)} weight="fill" color={colors.white} />
          )}
        </View>

        <View style={styles.categoryDes}>
          <Typo size={17} color={themeColors.text}>{category.label}</Typo>
          <Typo 
            size={12} 
            color={themeColors.textSecondary} 
            textProps={{ numberOfLines: 1 }}
          >
            {item.description || 'No description'}
          </Typo>
        </View>

        <View style={styles.amountDate}>
          <Typo 
            fontWeight={'500'} 
            color={item.type === 'income' ? colors.green : colors.rose}
          >
            {item.type === 'income' ? '+ ' : '- '}{formattedAmount}
          </Typo>
          <Typo size={13} color={themeColors.textSecondary}>
            {date}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TransactionList;

// Styles
const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
  },
  list: {
    minHeight: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._12,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius._12,
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: 'flex-end',
    gap: 3,
  },
});
