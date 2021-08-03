import React, { useState, ReactPropTypes, useEffect, useContext } from 'react';
import { sp } from "@pnp/sp";
import { SPAppContext } from './SPApp';
import { FieldArray, FieldArrayRenderProps, isFunction } from 'formik';

interface SPListProps {  
  name: string  
  children?:
    | ((props: {
        arrayHelpers: FieldArrayRenderProps, 
        addItem: (item?: any) => void,
        deleteItem: (item: any) => void,
        listValues: any[]
      }) => React.ReactNode)
    | React.ReactNode;
}

interface SPListState {  
  loaded: boolean
  list?: any
  fields?: any
  error: any
}

interface SPListContext {
  listName: string
  getFieldProps?: (name:string, index?:number) => any
  index?: number
}

export const SPListContext = React.createContext<SPListContext>({
  listName: ""
})

const pnpLists = sp.web.lists
//.getByTitle("Email QNA Associations");

export function SPList({name, children}:SPListProps){ 

  const appContext = useContext(SPAppContext);
  const list = appContext.lists[name]
  const listSchema = appContext.spAppSchema.filter(v => v.name === name)[0]  

  const getFieldProps = (fieldName:string, index?:number) => {
    let fieldProps:any = {}
    const field = list.fields.filter((v:any) => v.InternalName === fieldName)[0];    
    if (field){      
      const updatedFieldName = ["User", "UserMulti"].includes(field.TypeAsString) ? `${fieldName}Id` : fieldName
      fieldProps.name = listSchema.parent ? `${name}[${index}].${updatedFieldName}` : `${name}.${updatedFieldName}`
      fieldProps.label = field.Title;
      if (field.TypeAsString == "Choice" && field.Choices)
        fieldProps.options = field.Choices.results.map((i:any) => ({key: i, text: i}))
      if (field.TypeAsString == "MultiChoice" && field.Choices){
        fieldProps.options = field.Choices.results.map((i:any) => ({key: i, text: i}))
        fieldProps.multiSelect = true
      }
    }    
    return fieldProps    
  }
  
  const getFilteredListValues = () => {
    const {values} = appContext
    return values[name]
    //.filter((v:any) => v.__metadata && !v.__metadata.deleted || !v.__metadata)
  }

  return (<>         
    { !listSchema.parent 
      ? <SPListContext.Provider value={{
          listName: name,
          getFieldProps
        }}>
          {children ? children : null}
        </SPListContext.Provider>
    :
      <FieldArray
        name={name}
        render={arrayHelpers => { 
          const addItem = (item?:any) => {
            appContext.addItem(name, item)
          }
          const deleteItem = (item:any) => {
            appContext.deleteItem(item, name)
          }
          return <>
            <SPListContext.Provider value={{
              listName: name,
              getFieldProps
            }}>
              { isFunction(children) 
                ? children({arrayHelpers, addItem, deleteItem, listValues: getFilteredListValues()}) 
                : children
              }
            </SPListContext.Provider>
          </>
        }}
      />
    }
  </>)
}