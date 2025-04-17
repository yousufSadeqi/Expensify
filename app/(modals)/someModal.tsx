import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/themeContext'
import { ModalWrapper } from '@/components/ModalWrapper'
import { Typo } from '@/components/Typo'

const SomeModal = () => {
  const { themeColors } = useTheme();
  
  return (
    <ModalWrapper>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Typo color={themeColors.text}>Some Text</Typo>
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          {/* ... */}
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
  }
});

export default SomeModal 