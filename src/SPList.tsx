import React, { useState, ReactPropTypes, useEffect } from 'react';
import { sp } from "@pnp/sp";

interface SPListProps{  
  name: string  
  children: React.ReactNode
}

interface SPListState{  
  loaded: boolean
  list?: any
  fields?: any
  error: any
}

interface SPListContext {
  listName: string
  getFieldProps?: (name:string) => any
}

export const SPListContext = React.createContext<SPListContext>({
  listName: ""
})

const pnpLists = sp.web.lists
//.getByTitle("Email QNA Associations");

export function SPList(props:SPListProps){ 
  const [state, setState] = useState<SPListState>({    
    loaded: false,
    error: null
  })

  useEffect(() => {
    if (!state.loaded){
      loadList()
    }
  })

  const loadList = async () => {
    let newState = state
    try {
      newState.list = await pnpLists.getByTitle(props.name).get()
      newState.fields = await pnpLists.getByTitle(props.name).fields.get()
    }
    catch(e){
      newState.error = e
      console.error(e)
    }
    newState.loaded = true;
    setState({     
      ...newState      
    })
  }

  const getFieldProps = (name:string) => {
    let props:any = {}
    const field = state.fields[state.fields.map((i:any) => i.InternalName).indexOf(name)];
    if (field){
      props.label = field.Title;
      if (field.TypeAsString == "Choice" && field.Choices)
        props.options = field.Choices.results.map((i:any) => ({key: i, text: i}))
      if (field.TypeAsString == "MultiChoice" && field.Choices){
        props.options = field.Choices.results.map((i:any) => ({key: i, text: i}))
        props.multiSelect = true
      }
    }
    return props    
  }

  return (<>
  {state.loaded //? <h1>Loaded</h1> : <h1>Not Loaded</h1>
    ? (state.error 
      ? <>
        <h4>Error Loading SPList {props.name}</h4>        
      </>
      : <>        
         <SPListContext.Provider value={{
           listName: props.name,
           getFieldProps
         }}>
          {props ? props.children : null}
         </SPListContext.Provider>        
      </>
    )
    : null
  }</>)
}