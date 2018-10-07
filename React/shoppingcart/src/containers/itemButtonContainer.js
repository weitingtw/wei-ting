import { connect } from "react-redux";
import itemButton from "../components/itemButton.jsx";
import addItem from "../actions/addItem";

const mapDispatchToProps = dispatch =>{
  return {
      onAdd: (name, price) =>{
          dispatch(addItem(name, price));
      }
      
  };  
};

const ItemButtonContainer = connect(null, mapDispatchToProps)(itemButton);

export default ItemButtonContainer;