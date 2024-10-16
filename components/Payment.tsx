
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
import {getFullUrl, endpoints} from "@/apiConfig";

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


  const rideUrl = getFullUrl(endpoints.createRide); // Get the API URL
  console.log("Ride API URL:", rideUrl); // Log the API URL

  try {
    const response = await fetchAPI(rideUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rideDetails),
    });

    // Log the entire response for debugging
    console.log('Response:', response);

    // Check for response status
    if (!response.ok) {
      const errorData = await response.json(); // Get the error message if available
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error}`);
    }

    const data = await response.json(); // Assuming the response contains the ride data
    console.log('Ride created successfully:', data);
  } catch (error: unknown) { // Specify the type of error
    if (error instanceof Error) {
      console.warn("Error storing ride details:", error.message); // Log the error message
    } else {
      console.warn("An unknown error occurred while storing ride details:", error); // Log the unknown error
    }
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
    flex: 1, // Allow the container to take full height
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    marginBottom: 20, // Add some space from the bottom
  },
});

export default Payment;
