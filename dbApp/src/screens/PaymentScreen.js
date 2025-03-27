import React from 'react';
import { View, Text, StyleSheet, Image ,TouchableOpacity} from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { 
    username,
    slotId,
    parkingType,
    fee,
    startTime,
    endTime,
    months
  } = route.params;

  // Generate dummy IDs for demo
  const payment_id = `PAY-${Math.random().toString(36).substr(2, 9)}`;
  const reservation_id = `RES-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Summary</Text>
      
      <View style={styles.detailBox}>
        <Text style={styles.detailText}>Username: {username}</Text>
        <Text style={styles.detailText}>Slot ID: {slotId}</Text>
        <Text style={styles.detailText}>Type: {parkingType.toUpperCase()}</Text>
        <Text style={styles.detailText}>Total Fee: ฿{fee}</Text>
        <Text style={styles.detailText}>Payment ID: {payment_id}</Text>
        <Text style={styles.detailText}>Reservation ID: {reservation_id}</Text>
      </View>

      <Image 
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png' }}
        style={styles.qrCode}
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          navigation.navigate("Myparking");
        }}
      >
        <Text style={styles.buttonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  detailBox: { 
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  detailText: { fontSize: 16, marginBottom: 8 },
  qrCode: { 
    width: 200, 
    height: 200, 
    alignSelf: 'center',
    marginVertical: 20 
  },
  button: {
    backgroundColor: '#B19CD8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default PaymentScreen;