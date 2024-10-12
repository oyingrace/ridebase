
 import React, { useState } from "react";
 import { View, TextInput, FlatList, TouchableOpacity, Text, Image } from "react-native";
 import { icons } from "@/constants";
 import { GoogleInputProps } from "@/types/type";
 
 // Define the type for the Nominatim API response
 interface NominatimResult {
   place_id: string;
   display_name: string;
   lat: string;
   lon: string;
 }
 
 const GoogleTextInput = ({
   icon,
   initialLocation,
   containerStyle,
   textInputBackgroundColor,
   handlePress,
 }: GoogleInputProps) => {
   const [query, setQuery] = useState<string>(""); // Type state as string
   const [results, setResults] = useState<NominatimResult[]>([]); // Type state to hold Nominatim results
 
   // Function to search Nominatim API
   const searchLocation = async (searchQuery: string) => {
     try {
       const response = await fetch(
         `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5`
       );
       const data: NominatimResult[] = await response.json(); // Type the API response
       setResults(data); // Store the fetched results in state
     } catch (error) {
       console.error("Error fetching location data:", error);
     }
   };
 
   return (
     <View
       style={{
         alignItems: "center",
         justifyContent: "center",
         borderRadius: 20,
         marginHorizontal: 20,
         position: "relative",
         shadowColor: "#d4d4d4",
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 4,
         backgroundColor: textInputBackgroundColor || "white",
         zIndex: 50,
       }}
     >
       <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
         <View style={{ justifyContent: "center", alignItems: "center", width: 24, height: 24 }}>
           <Image
             source={icon ? icon : icons.search}
             style={{ width: 24, height: 24 }}
             resizeMode="contain"
           />
         </View>
 
         {/* Text Input for Location Search */}
         <TextInput
           placeholder={initialLocation ?? "Where do you want to go?"}
           placeholderTextColor="gray"
           style={{
             backgroundColor: textInputBackgroundColor || "white",
             fontSize: 16,
             fontWeight: "600",
             marginTop: 5,
             width: "90%",
             paddingHorizontal: 15,
             paddingVertical: 10,
           }}
           value={query}
           onChangeText={(text) => {
             setQuery(text);
             if (text.length > 2) {
               searchLocation(text); 
             } else {
               setResults([]); 
             }
           }}
         />
       </View>
 
       {/* Autocomplete Suggestions */}
       {results.length > 0 && (
         <FlatList
           data={results}
           keyExtractor={(item) => item.place_id}
           style={{
             backgroundColor: textInputBackgroundColor || "white",
             borderRadius: 10,
             shadowColor: "#d4d4d4",
             zIndex: 99,
             marginTop: 5,
             maxHeight: 200,
             width: "100%",
           }}
           renderItem={({ item }) => (
             <TouchableOpacity
               onPress={() => {
                 handlePress({
                   latitude: parseFloat(item.lat), // Convert string to number
                   longitude: parseFloat(item.lon),
                   address: item.display_name,
                 });
                 setQuery(item.display_name); 
                 setResults([]); 
               }}
               style={{
                 padding: 10,
                 borderBottomWidth: 1,
                 borderBottomColor: "#d4d4d4",
               }}
             >
               <Text>{item.display_name}</Text>
             </TouchableOpacity>
           )}
         />
       )}
     </View>
   );
 };
 
 export default GoogleTextInput;
 