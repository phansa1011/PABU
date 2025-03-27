import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReservationScreen = ({ route, navigation }) => {
  const { slotId, username } = route.params;
  const [parkingType, setParkingType] = useState('hourly');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [months, setMonths] = useState(3);
  
  // Dropdown states
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Hourly', value: 'hourly'},
    {label: 'Daily', value: 'daily'},
    {label: 'Monthly', value: 'monthly'}
  ]);

  // DateTimePicker states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const calculateFee = () => {
    const rates = { hourly: 50, daily: 500, monthly: 1000 };
    if (parkingType === 'hourly') {
      const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
      return hours * rates.hourly;
    }
    return rates[parkingType] * (parkingType === 'monthly' ? months : 1);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Reservation for {slotId}</Text>
        
        {/* Dropdown Container */}
        <View style={{ zIndex: 5000 }}>
          <Text style={styles.label}>Parking Type:</Text>
          <DropDownPicker
            open={open}
            value={parkingType}
            items={items}
            setOpen={setOpen}
            setValue={setParkingType}
            setItems={setItems}
            placeholder="Select parking type"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            selectedItemLabelStyle={styles.selectedItem}
            zIndex={5000}
            zIndexInverse={1000}
            listMode="MODAL"
          />
        </View>

        {parkingType === 'hourly' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => setShowStartPicker(true)}
            >
              <Text>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>End Time:</Text>
            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => setShowEndPicker(true)}
            >
              <Text>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {parkingType === 'monthly' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Months:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(months)}
              onChangeText={(text) => setMonths(Math.max(3, parseInt(text) || 3))}
            />
          </View>
        )}

        <Text style={styles.feeText}>Total Fee: ฿{calculateFee()}</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Payment', {
            username,
            slotId,
            parkingType,
            fee: calculateFee(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            months
          })}
        >
          <Text style={styles.buttonText}>Continue to Payment</Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setStartTime(selectedDate);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setEndTime(selectedDate);
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333'
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#B19CD8',
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#f8f9fa',
    borderColor: '#B19CD8',
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333'
  },
  selectedItem: {
    color: '#B19CD8',
    fontWeight: 'bold'
  },
  inputGroup: { 
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8,
    color: '#555'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#B19CD8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#B19CD8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15
  },
  feeText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#B19CD8',
    marginVertical: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#B19CD8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ReservationScreen;
