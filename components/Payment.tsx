
import { StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";
import WagmiDemo from "@/src/wagmiDemo"; 
import { fetchAPI } from "@/lib/fetch";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { userAddress, userLongitude, userLatitude, destinationLatitude, destinationAddress, destinationLongitude } = useLocationStore();
  const { userId } = useAuth();
  const [walletModalVisible, setWalletModalVisible] = useState(false); 
  const [success, setSuccess] = useState(false);


  const storeRideDetails = async () => {
    const rideDetails = {
      origin_address: userAddress,
      destination_address: destinationAddress,
      origin_latitude: userLatitude,
      origin_longitude: userLongitude,
      destination_latitude: destinationLatitude,
      destination_longitude: destinationLongitude,
      ride_time: rideTime.toFixed(0),
      fare_price: parseInt(amount) * 100, // Adjust as needed
      payment_status: "paid", // Assuming payment is confirmed
      driver_id: driverId,
      user_id: userId,
    };

    try {
      const response = await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideDetails),
      });

    } catch (error) {
      console.warn("Error storing ride details:", error);
    }
  };



  return (
    <>
      {/* Button to open wallet modal */}
      <View style={styles.buttonContainer}>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={() => setWalletModalVisible(true)} // Open the wallet modal
      />
      </View>

      {/* Wallet Connection Modal */}
      <ReactNativeModal
        isVisible={walletModalVisible}
        onBackdropPress={() => setWalletModalVisible(false)} 
        animationOut="slideOutDown"
        style={{ justifyContent: "flex-end", margin: 0 }} 
      >
        <View
          style={{
            height: "50%", 
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Please connect your wallet to book your ride.
          </Text>

          <Text className="text-md text-general-200 text-red-500 font-JakartaBold text-center mt-3">
            If you are in Nigeria, kindly use a VPN to proceed.
          </Text>

          <WagmiDemo setBookingSuccess={(success) => {
            if (success) {
              setSuccess(true); // Set success modal visibility
              storeRideDetails(); // Call function to store ride details
            }
          }} />

        </View>
      </ReactNativeModal>



      {/* Success Modal */}
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              // Navigate to home or other screen
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1, // Allow the container to take full height
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    marginBottom: 20, // Add some space from the bottom
  },
});

export default Payment;
