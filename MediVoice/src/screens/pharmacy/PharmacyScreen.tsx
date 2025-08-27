import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { Pharmacy, MedicineOrder, MedicineOrderItem, Prescription } from '../../types';
import { t } from '../../i18n';

const PharmacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<MedicineOrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock pharmacy data
  const [pharmacies] = useState<Pharmacy[]>([
    {
      id: '1',
      name: 'MedPlus Pharmacy',
      address: '123 Main Street, City Center',
      phone: '+91 98765 43210',
      email: 'medplus@example.com',
      rating: 4.5,
      isOpen: true,
      deliveryAvailable: true,
      location: { latitude: 0, longitude: 0 },
    },
    {
      id: '2',
      name: 'HealthCare Pharmacy',
      address: '456 Park Avenue, Downtown',
      phone: '+91 98765 43211',
      email: 'healthcare@example.com',
      rating: 4.3,
      isOpen: true,
      deliveryAvailable: true,
      location: { latitude: 0, longitude: 0 },
    },
  ]);

  // Mock medicine database
  const medicines = [
    { name: 'Paracetamol 500mg', category: 'Pain Relief', price: 50, prescription: false },
    { name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 80, prescription: false },
    { name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 120, prescription: true },
    { name: 'Omeprazole 20mg', category: 'Antacid', price: 150, prescription: false },
    { name: 'Cetirizine 10mg', category: 'Antihistamine', price: 60, prescription: false },
    { name: 'Metformin 500mg', category: 'Diabetes', price: 200, prescription: true },
    { name: 'Amlodipine 5mg', category: 'Blood Pressure', price: 180, prescription: true },
    { name: 'Atorvastatin 10mg', category: 'Cholesterol', price: 250, prescription: true },
    { name: 'Vitamin D3 1000IU', category: 'Vitamin', price: 100, prescription: false },
    { name: 'Calcium Carbonate 500mg', category: 'Mineral', price: 90, prescription: false },
  ];

  const categories = ['All', 'Pain Relief', 'Antibiotic', 'Antacid', 'Antihistamine', 'Diabetes', 'Blood Pressure', 'Cholesterol', 'Vitamin', 'Mineral'];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: any) => {
    const existingItem = cart.find(item => item.name === medicine.name);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.name === medicine.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, { ...medicine, quantity: 1 }]);
    }
    Alert.alert('Added to Cart', `${medicine.name} added to cart`);
  };

  const removeFromCart = (medicineName: string) => {
    setCart(prev => prev.filter(item => item.name !== medicineName));
  };

  const updateQuantity = (medicineName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineName);
    } else {
      setCart(prev => prev.map(item => 
        item.name === medicineName 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const order: MedicineOrder = {
        id: Date.now().toString(),
        patientId: userProfile?.id || '',
        pharmacyId: pharmacies[0].id, // Default to first pharmacy
        medicines: cart,
        totalAmount: getCartTotal(),
        status: 'pending',
        deliveryAddress: userProfile?.address || 'Home Address',
        paymentStatus: 'pending',
        createdAt: new Date(),
      };

      // Save order to storage
      const existingOrders = await getStoredOrders();
      existingOrders.push(order);
      await AsyncStorage.setItem('medicineOrders', JSON.stringify(existingOrders));

      // Clear cart
      setCart([]);

      Alert.alert(
        'Order Placed Successfully',
        `Your order has been placed. Order ID: ${order.id}`,
        [
          { text: 'OK', onPress: () => navigation.navigate('Orders') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const getStoredOrders = async (): Promise<MedicineOrder[]> => {
    try {
      const orders = await AsyncStorage.getItem('medicineOrders');
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      return [];
    }
  };

  const renderMedicineItem = ({ item }: { item: any }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{item.name}</Text>
          <Text style={styles.medicineCategory}>{item.category}</Text>
          {item.prescription && (
            <Text style={styles.prescriptionBadge}>Prescription Required</Text>
          )}
        </View>
        <Text style={styles.medicinePrice}>₹{item.price}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }: { item: MedicineOrderItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price} each</Text>
      </View>
      <View style={styles.cartItemActions}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.name, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.name, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Pharmacy</Text>
          <Text style={styles.subtitle}>Order medicines online</Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cart */}
        {cart.length > 0 && (
          <View style={styles.cartSection}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Shopping Cart</Text>
              <Text style={styles.cartCount}>({cart.length} items)</Text>
            </View>
            
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.name}
              scrollEnabled={false}
            />

            <View style={styles.cartTotal}>
              <Text style={styles.totalText}>Total: ₹{getCartTotal()}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
              onPress={placeOrder}
              disabled={loading}
            >
              <Text style={styles.checkoutButtonText}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Medicines List */}
        <View style={styles.medicinesSection}>
          <Text style={styles.sectionTitle}>Available Medicines</Text>
          <FlatList
            data={filteredMedicines}
            renderItem={renderMedicineItem}
            keyExtractor={(item) => item.name}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Nearby Pharmacies */}
        <View style={styles.pharmaciesSection}>
          <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
          {pharmacies.map((pharmacy) => (
            <View key={pharmacy.id} style={styles.pharmacyCard}>
              <View style={styles.pharmacyHeader}>
                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                <Text style={styles.pharmacyRating}>⭐ {pharmacy.rating}</Text>
              </View>
              <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
              <View style={styles.pharmacyStatus}>
                <Text style={[styles.statusText, pharmacy.isOpen && styles.statusOpen]}>
                  {pharmacy.isOpen ? 'Open' : 'Closed'}
                </Text>
                {pharmacy.deliveryAvailable && (
                  <Text style={styles.deliveryText}>🚚 Delivery Available</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#3498db',
  },
  filterChipText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  cartSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cartCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  cartTotal: {
    alignItems: 'flex-end',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checkoutButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  medicinesSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  medicineCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  medicineCategory: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  prescriptionBadge: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  addToCartButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pharmaciesSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  pharmacyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  pharmacyRating: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  pharmacyStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  statusOpen: {
    color: '#27ae60',
  },
  deliveryText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
});

export default PharmacyScreen; 