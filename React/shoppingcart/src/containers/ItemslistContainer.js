import { connect } from "react-redux";
import Itemslist from "../components/Itemslist.jsx";
import addToCart from "../actions/addToCart";

const mapStateToProps = state => {
  return {
    shopItems: state.shopItems
  };
};

const mapDispatchToProps = dispatch =>{
  return {
      onAdd: (name, price, id) =>{
          dispatch(addToCart(name, price, id));
      }
  };  
};

const ItemlistContainer = connect(mapStateToProps, mapDispatchToProps)(Itemslist);

export default ItemlistContainer;