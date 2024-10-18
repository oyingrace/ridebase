
import React, { useEffect } from "react";
import { router } from "expo-router";
import { FlatList, View, ActivityIndicator, Text } from "react-native";
import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";

const ConfirmRide = () => {
  const { drivers = [], selectedDriver, setSelectedDriver, loading, fetchDrivers } = useDriverStore();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-2">Loading drivers...</Text>
        </View>
      );
    }

    if (drivers.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text>No drivers available at the moment.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Ride"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    );
  };

  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
      {renderContent()}
    </RideLayout>
  );
};

export default ConfirmRide;