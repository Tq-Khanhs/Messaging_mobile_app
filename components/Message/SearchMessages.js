import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatMessageTime } from '../../utils/timeUtils';

const SearchMessages = ({ contactId, onClose, onScrollToMessage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Mock data for testing
  const mockMessages = [
    {
      id: 1,
      text: "Xin chào, bạn khoẻ không?",
      timestamp: new Date(2023, 4, 10, 8, 0),
      isMe: false,
      sender: {
        id: 2,
        name: "Nguyễn Minh Đức",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      }
    },
    {
      id: 2,
      text: "Mình khoẻ, cảm ơn bạn!",
      timestamp: new Date(2023, 4, 10, 8, 5),
      isMe: true,
      sender: {
        id: 1,
        name: "Tôi",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      }
    },
    {
      id: 3,
      text: "Bạn có thể giúp mình việc này được không?",
      timestamp: new Date(2023, 4, 10, 8, 10),
      isMe: false,
      sender: {
        id: 2,
        name: "Nguyễn Minh Đức",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      }
    },
    {
      id: 5,
      text: "Tui sửa xong á, mà làm sao để coi data á ông ơi, tui test cái",
      timestamp: new Date(2023, 4, 15, 10, 30),
      isMe: false,
      sender: {
        id: 2,
        name: "Nguyễn Minh Đức",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      }
    },
    {
      id: 6,
      text: "Okay",
      timestamp: new Date(2023, 4, 15, 10, 32),
      isMe: true,
      sender: {
        id: 1,
        name: "Tôi",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      }
    },
    {
      id: 7,
      text: "Tui clone lại code branch main về sửa lại r á",
      timestamp: new Date(2023, 4, 17, 10, 35),
      isMe: false,
      sender: {
        id: 2,
        name: "Nguyễn Minh Đức",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      }
    },
    {
      id: 8,
      text: "nay cảm ơn ông nha , ông chia phần cho tui với , chiều tui làm á , tuần sau nhiều k le sợ k kịp @@",
      timestamp: new Date(2023, 4, 17, 10, 36),
      isMe: false,
      sender: {
        id: 2,
        name: "Nguyễn Minh Đức",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      }
    }
  ];

  useEffect(() => {
    // Auto search when component mounts if there's a query
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Filter messages that contain the search query (case insensitive)
      const results = mockMessages.filter(message => 
        message.text && message.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(results);
      setTotalResults(results.length);
      setCurrentResultIndex(results.length > 0 ? 0 : -1);
      setLoading(false);

      // If we have results, scroll to the first one
      if (results.length > 0 && onScrollToMessage) {
        onScrollToMessage(results[0]);
      }
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setTotalResults(0);
  };

  const navigateToResult = (index) => {
    if (searchResults.length === 0) return;
    
    // Ensure index is within bounds
    const newIndex = Math.max(0, Math.min(index, searchResults.length - 1));
    setCurrentResultIndex(newIndex);
    
    // Scroll to the selected message
    if (onScrollToMessage) {
      onScrollToMessage(searchResults[newIndex]);
    }
  };

  const handlePrevResult = () => {
    navigateToResult(currentResultIndex - 1);
  };

  const handleNextResult = () => {
    navigateToResult(currentResultIndex + 1);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor="#AAAAAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus={true}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Icon name="close" size={20} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#0084FF" />
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084FF" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          {/* Navigation Bar at the bottom */}
          <View style={styles.navigationBar}>
            <Text style={styles.resultCount}>
              Kết quả thứ {currentResultIndex + 1}/{totalResults}
            </Text>
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={[styles.navButton, currentResultIndex === 0 && styles.disabledNavButton]}
                onPress={handlePrevResult}
                disabled={currentResultIndex === 0}
              >
                <Icon 
                  name="keyboard-arrow-up" 
                  size={24} 
                  color={currentResultIndex === 0 ? "#666666" : "#FFFFFF"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, currentResultIndex === totalResults - 1 && styles.disabledNavButton]}
                onPress={handleNextResult}
                disabled={currentResultIndex === totalResults - 1}
              >
                <Icon 
                  name="keyboard-arrow-down" 
                  size={24} 
                  color={currentResultIndex === totalResults - 1 ? "#666666" : "#FFFFFF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : searchQuery.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={48} color="#AAAAAA" />
          <Text style={styles.noResultsText}>Không tìm thấy kết quả nào</Text>
          <Text style={styles.noResultsSubtext}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Icon name="search" size={48} color="#AAAAAA" />
          <Text style={styles.emptyStateText}>Tìm kiếm tin nhắn</Text>
          <Text style={styles.emptyStateSubtext}>Nhập từ khóa để tìm kiếm tin nhắn</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: '#001F3F', // Dark blue background like in the screenshot
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
    marginRight: 5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: 40,
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    padding: 8,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  resultsContainer: {
    flex: 1,
    position: 'relative',
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    zIndex: 2,
  },
  resultCount: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
  },
  disabledNavButton: {
    backgroundColor: '#222222',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  noResultsSubtext: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptyStateSubtext: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default SearchMessages;