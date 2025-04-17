import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { BarChart } from 'react-native-gifted-charts'
import Header from '@/components/Header'
import Loading from '@/components/loading'
import { useAuth } from '@/contexts/authContext'
import { fetchAnnuallyStats, fetchMonthlyStats, fetchWeeklyStats } from '@/service/transactionService'
import TransactionList from '@/components/TransactionList'

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [chartLoading, setChartLoading] = useState(false)
  const { user } = useAuth()

  const [chartData, setChartData] = useState([]);
  const [transaction, setTransaction] = useState([]);

  // Update chartData when activeIndex changes
  const updateChartData = (index: number) => {
    switch (index) {
      case 0:
        getWeeklyStats();
        break;
      case 1:
        getMonthlyStats();
        break;
      case 2:
        getAnnuallyStats();
        break;
      default:
        setChartData([]);
    }
  };

  useEffect(() => {
    updateChartData(activeIndex);
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    const res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data.stats);
      setTransaction(res?.data?.transactions); // fixed typo: 'transaction' -> 'transactions'
    } else {
      Alert.alert('Error', res.msg);
    }
  }

  const getMonthlyStats = async () => {
    setChartLoading(true);
    const res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data.stats);
      setTransaction(res?.data?.transactions); // Added transactions to monthly stats
    } else {
      Alert.alert('Error', res.msg);
    }
  }

  const getAnnuallyStats = async () => {
    setChartLoading(true);
    const res = await fetchAnnuallyStats(user?.uid as string); 
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data.stats);
      setTransaction(res?.data?.transactions); 
    } else {
      Alert.alert('Error', res.msg);
    }
  }

  // Update chart data when activeIndex changes
  const handleSegmentChange = (event: any) => {
    const newIndex = event.nativeEvent.selectedSegmentIndex;
    setActiveIndex(newIndex);
    updateChartData(newIndex);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title='Statistics' />
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100)
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={['Weekly', 'Monthly', 'Annually']}
            selectedIndex={activeIndex}
            onChange={handleSegmentChange}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance='dark'
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />

          <View style={styles.chartContainer}>
            {
              chartData.length > 0 ? (
                <BarChart
                  data={chartData}
                  barWidth={scale(12)}
                  spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
                  roundedTop
                  roundedBottom
                  hideRules
                  yAxisLabelPrefix='$'
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: colors.neutral400 }}
                  xAxisLabelTextStyle={{ color: colors.neutral400 }}
                  noOfSections={3}
                  minHeight={5}
                  labelWidth={scale(40)}
                  yAxisLabelWidth={[1, 2].includes(activeIndex) ? scale(28) : scale(35)}
                  height={verticalScale(250)}
                  isAnimated={true}
                />
              ) : (
                <View style={styles.noChart} />
              )
            }
            {
              chartLoading && (
                <View style={styles.chartLoadingContainer}>
                  <Loading color={colors.white} />
                </View>
              )
            }
          </View>

          <View>
            <TransactionList
              title='Transactions'
              emptyListMessage='No transactions found'
              data={transaction}
            />
          </View>

        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

export default Statistics;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: 'bold',
    color: colors.black,
  },
  header: {
    marginBottom: spacingY._10,
  },
  noChart: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    height: verticalScale(210),
    borderRadius: radius._12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: colors.white,
    fontSize: verticalScale(16),
    fontWeight: '500',
  },
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
    padding: spacingY._20,
    borderRadius: radius._12,
  },
  chartLoadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius._12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLoading: {}
})
