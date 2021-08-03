import React, { useState, useEffect } from 'react';
import { Stack } from '@fluentui/react';

export function SPTest(){

  const style:React.CSSProperties = {
    padding: 10,
    margin: 10,
    backgroundColor: "mediumslateblue",
    color: "whitesmoke"

  }
  return <Stack horizontal>
    <div style={style}>This</div>    
    <div style={style}>Is</div>
    <div style={style}>A</div>
    <div style={style}>Test</div>
  </Stack>
}