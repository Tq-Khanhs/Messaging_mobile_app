import { useState, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute } from "@react-navigation/native"

const { width } = Dimensions.get("window")

export default function PersonalInfoScreen({ navigation }) {
  const [birthday, setBirthday] = useState("")
  const [gender, setGender] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGenderPicker, setShowGenderPicker] = useState(false)

  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [selectedYear, setSelectedYear] = useState(2025)

  const dayScrollRef = useRef(null)
  const monthScrollRef = useRef(null)
  const yearScrollRef = useRef(null)

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  const genderOptions = [
    { id: "male", label: "Nam" },
    { id: "female", label: "Nữ" },
    { id: "private", label: "Không chia sẻ" },
  ]

  const route = useRoute()
  const { email, userId, password, fullName } = route.params || {}

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleContinue = async () => {
    if (!isFormValid) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      navigation.navigate("UploadAvt", {
        email,
        userId,
        password,
        fullName,
        birthdate: birthday,
        gender,
      })
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.")
      Alert.alert("Lỗi", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openDatePicker = () => {
    setShowDatePicker(true)

    setTimeout(() => {
      if (dayScrollRef.current) {
        dayScrollRef.current.scrollTo({ y: (selectedDay - 1) * 60, animated: false })
      }
      if (monthScrollRef.current) {
        monthScrollRef.current.scrollTo({ y: (selectedMonth - 1) * 60, animated: false })
      }
      if (yearScrollRef.current) {
        const yearIndex = years.findIndex((y) => y === selectedYear)
        if (yearIndex !== -1) {
          yearScrollRef.current.scrollTo({ y: yearIndex * 60, animated: false })
        }
      }
    }, 100)
  }

  const confirmDate = () => {
    const birthDate = new Date(`${selectedYear}-${selectedMonth}-${selectedDay}`)
    const today = new Date()

    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const dayDiff = today.getDate() - birthDate.getDate()

    const isOver16 = age > 16 || (age === 16 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))

    if (!isOver16) {
      alert("Bạn phải trên 16 tuổi")
      return
    }

    setBirthday(`${selectedDay}/${selectedMonth}/${selectedYear}`)
    setShowDatePicker(false)
  }

  const handleDayScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(offsetY / 60)
    if (index >= 0 && index < days.length) {
      setSelectedDay(days[index])
    }
  }

  const handleMonthScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(offsetY / 60)
    if (index >= 0 && index < months.length) {
      setSelectedMonth(months[index])
    }
  }

  const handleYearScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(offsetY / 60)
    if (index >= 0 && index < years.length) {
      setSelectedYear(years[index])
    }
  }

  const openGenderPicker = () => {
    setShowGenderPicker(true)
  }

  const selectGender = (option) => {
    setGender(option.label)
    setShowGenderPicker(false)
  }

  const isFormValid = birthday !== "" && gender !== ""

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Thêm thông tin cá nhân</Text>

 
        <TouchableOpacity style={styles.inputField} onPress={openDatePicker}>
          <Text style={[styles.inputText, !birthday && styles.placeholderText]}>{birthday || "Sinh nhật"}</Text>
          <Ionicons name="calendar-outline" size={24} color="#555" />
        </TouchableOpacity>


        <TouchableOpacity style={styles.inputField} onPress={openGenderPicker}>
          <Text style={[styles.inputText, !gender && styles.placeholderText]}>{gender || "Giới tính"}</Text>
          <Ionicons name="chevron-down" size={24} color="#555" />
        </TouchableOpacity>
      </View>


      <TouchableOpacity
        style={[styles.continueButton, !isFormValid || isLoading ? {} : styles.continueButtonActive]}
        disabled={!isFormValid || isLoading}
        onPress={handleContinue}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueButtonText}>Tiếp tục</Text>}
      </TouchableOpacity>


      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLine} />
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
            </View>

            <View style={styles.datePickerContainer}>

              <View style={styles.selectionHighlight} />


              <View style={styles.pickerColumnContainer}>
                <ScrollView
                  ref={dayScrollRef}
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={60}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleDayScroll}
                >
                  <View style={styles.pickerPadding} />
                  {days.map((day) => (
                    <View key={`day-${day}`} style={styles.pickerItem}>
                      <Text style={[styles.pickerItemText, selectedDay === day && styles.selectedPickerItemText]}>
                        {day}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.pickerPadding} />
                </ScrollView>
              </View>

              <View style={styles.pickerColumnContainer}>
                <ScrollView
                  ref={monthScrollRef}
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={60}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleMonthScroll}
                >
                  <View style={styles.pickerPadding} />
                  {months.map((month) => (
                    <View key={`month-${month}`} style={styles.pickerItem}>
                      <Text style={[styles.pickerItemText, selectedMonth === month && styles.selectedPickerItemText]}>
                        {month}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.pickerPadding} />
                </ScrollView>
              </View>

              <View style={styles.pickerColumnContainer}>
                <ScrollView
                  ref={yearScrollRef}
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={60}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleYearScroll}
                >
                  <View style={styles.pickerPadding} />
                  {years.map((year) => (
                    <View key={`year-${year}`} style={styles.pickerItem}>
                      <Text style={[styles.pickerItemText, selectedYear === year && styles.selectedPickerItemText]}>
                        {year}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.pickerPadding} />
                </ScrollView>
              </View>
            </View>

            <View style={styles.ageRequirement}>
              <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
              <Text style={styles.ageRequirementText}>Bạn cần đủ 14 tuổi để sử dụng Zalo</Text>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={confirmDate}>
              <Text style={styles.confirmButtonText}>Chọn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <Modal
        transparent={true}
        animationType="slide"
        visible={showGenderPicker}
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.genderModalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLine} />
              <Text style={styles.modalTitle}>Chọn giới tính</Text>
            </View>

            {genderOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.genderOption} onPress={() => selectGender(option)}>
                <Text style={styles.genderOptionText}>{option.label}</Text>
                {gender === option.label && <Ionicons name="checkmark" size={24} color="#0A84FF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputText: {
    color: "white",
    fontSize: 16,
  },
  placeholderText: {
    color: "#555",
  },
  continueButton: {
    backgroundColor: "#333333",
    borderRadius: 25,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  continueButtonActive: {
    backgroundColor: "#0A84FF",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  genderModalContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalHeaderLine: {
    width: 36,
    height: 5,
    backgroundColor: "#555",
    borderRadius: 3,
    marginBottom: 10,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  datePickerContainer: {
    flexDirection: "row",
    height: 180,
    marginVertical: 20,
    position: "relative",
  },
  selectionHighlight: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 60,
    marginTop: -30,
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    zIndex: 1,
  },
  pickerColumnContainer: {
    flex: 1,
    height: 180,
    overflow: "hidden",
  },
  pickerColumn: {
    flex: 1,
  },
  pickerPadding: {
    height: 60,
  },
  pickerItem: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    color: "#8E8E93",
    fontSize: 20,
  },
  selectedPickerItemText: {
    color: "white",
    fontWeight: "bold",
  },
  ageRequirement: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  ageRequirementText: {
    color: "#8E8E93",
    fontSize: 14,
    marginLeft: 6,
  },
  confirmButton: {
    backgroundColor: "#0A84FF",
    borderRadius: 25,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  genderOptionText: {
    color: "white",
    fontSize: 16,
  },
})
