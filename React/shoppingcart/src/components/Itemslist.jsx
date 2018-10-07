import React from "react";

const Itemslist = props => {
   
    
    if (Object.keys(props.shopItems).length == 0){
        return null;
    }
    return <div>
        {Object.keys(props.shopItems).map((items)=>{
            return (
                <div>
                    <button onClick = {() => props.onAdd(props.shopItems[items].name, props.shopItems[items].price, props.shopItems[items].id)}> add </button>
                    &nbsp;{props.shopItems[items].name} -- price: ${props.shopItems[items].price} 
                </div>
            )
        })}
    </div>
}

export default Itemslist;
