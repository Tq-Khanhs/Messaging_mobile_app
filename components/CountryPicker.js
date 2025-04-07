import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

export default function CountryPicker({ navigation, route }) {
  // Get the current selected code from route params or default to +84
  const currentCode = route.params?.currentCode || "+84";

  const countries = [
    { name: "Vietnam", code: "+84", selected: currentCode === "+84" },
    { name: "Myanmar", code: "+95", selected: currentCode === "+95" },
    { name: "South Korea", code: "+82", selected: currentCode === "+82" },
    { name: "China", code: "+86", selected: currentCode === "+86" },
    { name: "Afghanistan", code: "+93", selected: currentCode === "+93" },
    { name: "Andorra", code: "+376", selected: currentCode === "+376" },
    { name: "Angola", code: "+244", selected: currentCode === "+244" },
    { name: "Anguilla", code: "+1264", selected: currentCode === "+1264" },
    { name: "Antigua and Barbuda", code: "+1268", selected: currentCode === "+1268" },
    { name: "Argentina", code: "+54", selected: currentCode === "+54" },
    { name: "Aruba", code: "+297", selected: currentCode === "+297" },
    { name: "Australia", code: "+61", selected: currentCode === "+61" },
    { name: "Austria", code: "+43", selected: currentCode === "+43" },
    { name: "Bahamas", code: "+1242", selected: currentCode === "+1242" },
  ];
  
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCountries = filteredCountries.reduce((acc, country) => {
    const firstLetter = country.name[0];
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {});

  const handleSelectCountry = (country) => {
    navigation.replace('SignUp', { 
      countryCode: country.code,
      countryName: country.name
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.pop()}>
          <Icon name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Chọn mã quốc gia/vùng lãnh thổ</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search1" size={22} color="white" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888"
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.listContainer}>
          {Object.entries(groupedCountries).map(([letter, countries]) => (
            <View key={letter}>
              <Text style={styles.groupTitle}>{letter}</Text>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(country)}
                >
                  <Text style={styles.countryName}>
                    {country.name} ({country.code})
                  </Text>
                  {country.selected && <Icon name="check" size={23} color="blue" />}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    marginLeft: 4
  },
  groupTitle: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 8,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  countryName: {
    color: 'white',
  },
});
