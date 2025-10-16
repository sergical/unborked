import React, { createContext, useContext, useReducer } from 'react';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string } 
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } } 
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }; 

interface CartContextType {
  state: CartState;
  dispatch: (action: CartAction) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log(`Cart Action: ${action.type}`);
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM': {
      console.log(`Cart Action: REMOVE_ITEM - Product ID: ${action.payload}`);
      return {
        ...state,
        items: state.items.filter(item => String(item.id) !== String(action.payload)),
      };
    }
    case 'UPDATE_QUANTITY': {
      const idToUpdate = String(action.payload.id);
      console.log(`Cart Action: UPDATE_QUANTITY - Product ID: ${idToUpdate}, New Quantity: ${action.payload.quantity}`);
      return {
        ...state,
        items: state.items.map(item =>
          String(item.id) === idToUpdate
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      console.log('Cart Action: CLEAR_CART');
      return { ...state, items: [] };
    case 'SET_CART': 
      console.log(`Reducer SET_CART: Received payload: ${JSON.stringify(action.payload)}`);
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return { state: context.state, dispatch: context.dispatch }; 
};
