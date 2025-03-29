/*4. ตาราง payments (การชำระเงิน) front end เพิ่มรูปสลิป ต้องดูอีกทีว่าจะเก็บหลักฐานการโอนเป็นแบบไหน
payment_id (PK) – รหัสการชำระเงิน
reservation_id (FK) – รหัสการจอง
penalty_id (FK) – รหัสค่าปรับ
amount – จำนวนเงิน
payment_status – สถานะการจ่าย (pending, verified, failed)
bank_reference_number - หมายเลขอ้างอิงธนาคาร UNIQUE
รหัสค่าปรับยังเพิ่มมาไม่ได้เพราะยังไม่มีการบันทึกเวลาไว้ใน database 
payment_status – สถานะการจ่าย (pending, verified, failed)เพราะเราไม่ได้ทำจริงเลยไม่แน่ใจว่าต้องจำลองการเก็บยังไง*/

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
  const { username, slotId, parkingType, fee, floor } = route.params; // เพิ่ม floor

  // Generate dummy IDs for demo
  const payment_id = `PAY-${Math.random().toString(36).substr(2, 9)}`;
  const reservation_id = `RES-${Math.random().toString(36).substr(2, 9)}`;
  const bank_reference_number = `BANK-${Math.floor(100000 + Math.random() * 900000)}`;

  const [isModalVisible, setModalVisible] = useState(false);

  const handleConfirmPayment = () => {
    setModalVisible(true); // แสดง Modal

    setTimeout(() => {
      setModalVisible(false); // ปิด Modal
      navigation.navigate("Myparking"); // ไปหน้า Myparking
    }, 2000); // รอ 2 วินาทีก่อนเปลี่ยนหน้า
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Summary</Text>

      <View style={styles.detailBox}>
        <Text style={styles.detailText}>Username: {username}</Text>
        <Text style={styles.detailText}>Slot ID: {slotId}</Text>
        <Text style={styles.detailText}>Floor: {floor}</Text> {/* ✅ เพิ่มชั้นที่จอง */}
        <Text style={styles.detailText}>Type: {parkingType.toUpperCase()}</Text>
        <Text style={styles.detailText}>Total Fee: ฿{fee}</Text>
        <Text style={styles.detailText}>Payment ID: {payment_id}</Text>
        <Text style={styles.detailText}>Reservation ID: {reservation_id}</Text>
        <Text style={styles.detailText}>Bank Ref: {bank_reference_number}</Text>
      </View>

      <Image 
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png' }}
        style={styles.qrCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleConfirmPayment}>
        <Text style={styles.buttonText}>Confirm Payment</Text>
      </TouchableOpacity>

      {/* ✅ Modal ยืนยันการชำระเงิน ✅ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>✅ Payment Successful!</Text>
            <Text style={styles.modalSubText}>Your payment has been processed.</Text>
          </View>
        </View>
      </Modal>
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
  },
  // ✅ สไตล์สำหรับ Modal ✅
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ทำให้พื้นหลังมืดลง
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default PaymentScreen;