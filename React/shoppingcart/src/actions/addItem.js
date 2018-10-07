import {ADD_ITEM} from "../constants/constants.js";

var id = 0;
const addItem = (name, price) =>{
  return {
      type: ADD_ITEM,
      item:{
          name: name,
          price: price,
          id: id++
      }
  }  
    
};

export default addItem;