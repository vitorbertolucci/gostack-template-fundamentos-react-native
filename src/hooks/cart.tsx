import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedProdutcts = await AsyncStorage.getItem('@GoBarber:products');

      if (!loadedProdutcts) {
        return;
      }

      setProducts(JSON.parse(loadedProdutcts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    setProducts(current => {
      if (!current) {
        return current;
      }

      const newProducts = [...current];

      const existingProduct = newProducts.find(prod => prod.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        newProducts.push({ ...product, quantity: 1 });
      }

      AsyncStorage.setItem('@GoBarber:products', JSON.stringify(newProducts));
      return newProducts;
    });
  }, []);

  const increment = useCallback(async id => {
    setProducts(current => {
      const newProducts = [...current];

      const product = newProducts.find(prod => prod.id === id);
      if (product) {
        product.quantity += 1;
      }

      AsyncStorage.setItem('@GoBarber:products', JSON.stringify(newProducts));
      return newProducts;
    });
  }, []);

  const decrement = useCallback(async id => {
    setProducts(current => {
      const newProducts = [...current];

      const product = newProducts.find(prod => prod.id === id);
      if (product) {
        product.quantity -= 1;
      }

      AsyncStorage.setItem('@GoBarber:products', JSON.stringify(newProducts));
      return newProducts;
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
