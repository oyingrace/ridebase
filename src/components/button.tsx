import { TouchableOpacity, Text, StyleSheet } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => Promise<void> | void;
};

function CustomButton({ onPress, title }: CustomButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    alignItems: "center",
    justifyContent: "center",
    width: "80%", 
    alignSelf: "center", 
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    minHeight: 50, 
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
