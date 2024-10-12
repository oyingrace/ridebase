
import { StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { Link, router } from "expo-router";
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
      fare_price: parseInt(amount) * 100, 
      payment_status: "paid", 
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
        onPress={() => setWalletModalVisible(true)} 
      />
      </View>

     
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
              setSuccess(true); 
              storeRideDetails(); 
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
              router.push(`/(root)/(tabs)/rides`);
      
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
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 20, 
  },
});

export default Payment;
