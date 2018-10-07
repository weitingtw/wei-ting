import React from "react";

const itemButton = props =>{
    
    return <div><button onClick = {() => props.onAdd(props.name, props.price)}> submit</button></div>
}

export default itemButton;