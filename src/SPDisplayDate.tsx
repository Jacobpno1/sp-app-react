import "core-js";
import React from "react";

interface SPDisplayDateProps {
  isoDate: string
  showTime?: boolean
}



export function SPDisplayDate(props: SPDisplayDateProps){
  const date = new Date(props.isoDate)
  const hours = (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = (date.getHours() > 12) ? "PM" : "AM";
  return (
    <span>{date.toLocaleDateString("en-US") + (props.showTime ? " " + hours + ":" + minutes + " " + ampm : "")}</span>
  )
}