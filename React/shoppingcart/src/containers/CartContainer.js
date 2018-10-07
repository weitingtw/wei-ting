import { connect } from "react-redux";
import Cart from "../components/cart.jsx";
import deleteFromCart from "../actions/deleteFromCart";

const mapStateToProps = state => {
  return {
    cartItems: state.cartItems
  };
};

const mapDispatchToProps = dispatch =>{
  return {
      onDelete: (id) =>{
          dispatch(deleteFromCart(id));
      }
  };  
};

const CartContainer = connect(mapStateToProps, mapDispatchToProps)(Cart);

export default CartContainer;