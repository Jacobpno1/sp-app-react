import React, { useContext, useEffect, useState } from "react";
import { Field, Formik, FormikHelpers, FormikProps, isFunction } from "formik";
import { SharePointAttachment, SPFieldSchema, SPListSchema } from "./types";
import { Item, sp } from "@pnp/sp";
import * as Yup from 'yup';
import { MessageBar, MessageBarType } from "@fluentui/react";

sp.setup({
  sp: {
    headers: {
      "Accept": "application/json;odata=verbose"
    }
  },
});

const pnpLists = sp.web.lists

interface SPAppProps {      
  spAppSchema: SPListSchema[]
  formID?: number,
  children?:
    | ((props: {
      formikBag:FormikProps<any>
      saveApp: (listName?: string | undefined | null) => Promise<any>
      deleteApp: (listName?: string | undefined) => Promise<void>
    }) => React.ReactNode)
    | React.ReactNode;
}

interface SPAppState {  
  loaded: boolean
  lists: any
  listData: any
  loadError?: any
  saveError?: any
}

interface SPAppContext {  
  spAppSchema: SPListSchema[]
  lists: any 
  addItem: (listName: string, item?: any) => void
  deleteItem: (item: any, listName: string) => void
  values: any
}

export const SPAppContext = React.createContext<SPAppContext>({
  spAppSchema: [],
  lists: {},
  addItem: (listName: string) => {},
  deleteItem: (item: any, listName: string) => {},
  values: {}
})

export function SPApp({spAppSchema, formID, children}: SPAppProps){

  const [state, setState] = useState<SPAppState>({
    loaded: false,
    lists: {},
    listData: {}
  })
  
  //OnComponentMount
  useEffect(() => {
    loadApp()  
    // eslint-disable-next-line react-hooks/exhaustive-deps     
  }, [])

  const fieldIsUserField = (listName:string, fieldName:string, lists: any) => {    
    const SPListfield = lists[listName].fields.filter((v:any) => v.InternalName == fieldName)[0]
    return ["User", "UserMulti"].includes(SPListfield.TypeAsString)
  }

  const trasformSPFieldSchema = (listName: string, fields: SPFieldSchema[], state: SPAppState) => {
    const {lists} = state
    if (lists[listName])
      return fields.map(field => fieldIsUserField(listName, field.name, lists) ? {...field, name: `${field.name}Id`} : field)    
    else 
      throw(`Function trasformSPFieldSchema Errored - No ${listName} list found in state.lists`)
  }

  const getListForeignKey = (name:string) => {
    return spAppSchema.filter(v => v.name == name)[0].fields.filter(v => v.foreignKey)[0].name || ""
  }

  const getListFieldNames = (name: string, state: SPAppState) => {
    const list = spAppSchema.filter(v => v.name === name)[0]
    if (list)
      return [...trasformSPFieldSchema(name, list.fields, state).map(v => v.name), "ID"]
    else 
      throw(`Function getListFieldNames Errored - No ${name} list found in spAppSchema`)
  }

  const loadApp = async () => {
    let newState = {...state}
    try{
      newState.lists = Object.fromEntries(await Promise.all(spAppSchema.map(async v => {
        let list = await pnpLists.getByTitle(v.name).get()
        list.fields = await pnpLists.getByTitle(v.name).fields.get()
        return [v.name, list];
      })))
      if (formID) newState.listData = Object.fromEntries(await Promise.all(spAppSchema.map(async list => {
        let listData = list.parent 
          ? await pnpLists.getByTitle(list.name).items.select(...getListFieldNames(list.name, newState)).filter(`${getListForeignKey(list.name)} eq ${formID}`).get()
          : await pnpLists.getByTitle(list.name).items.getById(formID).select(...getListFieldNames(list.name, newState)).get()
        listData = Array.isArray(listData) 
          ? await Promise.all(listData.map(async (item:any) => ({
            ...item,
            AttachmentFiles: {results: await pnpLists.getByTitle(list.name).items.getById(item.ID).attachmentFiles.get()}
          })))
          : {...listData, AttachmentFiles: {results: await pnpLists.getByTitle(list.name).items.getById(formID).attachmentFiles.get()}}        
        return [list.name, listData]
      })))        
    }
    catch(e){
      console.error(e)
      newState.loadError = e      
    }
    newState.loaded = true;
    setState(newState)
  }

  const getTypeDefaultValue = (type: string) => {
    switch (type) {
      case "MultiChoice":
      case "UserMulti":
        return {
          results: []
        }
      case "Boolean":
        return false   
      case "Text": 
      case "Choice": 
      case "Note": 
      case "DateTime":
      case "Integer": 
      case "Number": 
      case "User":
      default:
        return ""
    }
  }

  const getFieldDefaultValue = (listName: string, fieldName: string) => {
    const {lists} = state
    const field = lists[listName].fields.filter((field:any) => field.InternalName == fieldName)[0]
    if (field){
      if (field.DefaultValue){
        if (field.TypeAsString === "MultiChoice") return {results: [field.DefaultValue]}
        if (field.TypeAsString === "Boolean") return field.DefaultValue === "1"
        return field.DefaultValue
      }
        // return field.TypeAsString === "MultiChoice" ? {results: [field.DefaultValue]} : field.DefaultValue
      else 
        return getTypeDefaultValue(field.TypeAsString)
    }
    else 
      throw(`Function getFieldDefaultValue Errored - No ${fieldName} field found in list ${listName}`)
  }

  const getListDefaultValues = (list:SPListSchema) => {
    const { lists } = state;
    return Object.fromEntries(list.fields.map(field => ([
      fieldIsUserField(list.name, field.name, lists) ? `${field.name}Id` : field.name,
      field.defaultValue || getFieldDefaultValue( list.name, field.name) 
    ])))
  }

  const getDefaultValues = () => { 
    const {listData} = state
    if (formID) {
      return Object.fromEntries(Object.entries(listData).map((v: any) => {
        const name = v[0]
        const data = v[1]
        const listSchema = spAppSchema.filter(listSchema => listSchema.name === name)[0]
        return [name, Array.isArray(data) 
          ? data.map(item => ({...getListDefaultValues(listSchema), ...removeNullValues(item)}))
          : {...getListDefaultValues(listSchema), ...removeNullValues(data)}]
      }))      
    }
    else 
      return Object.fromEntries(spAppSchema.map(list => {
        return list.parent 
          ? [list.name , list.defaultItems ? [...Array(list.defaultItems)].map(i => getListDefaultValues(list)) : []]
          : [list.name , getListDefaultValues(list)]
      }))
  }

  const getYupType = (type: string) => {
    switch (type) {
      case "Text": 
      case "Choice": 
      case "Note": 
      case "DateTime":            
        return Yup.string().required("This field cannot be blank")
      case "Integer": 
      case "Number": 
      case "User":
        return Yup.mixed().required("This field cannot be blank") 
      case "MultiChoice":
      case "UserMulti":
        return Yup.object().shape({
          results: Yup.array().min(1, "This field cannot be blank")
        })
      case "Boolean":
        return  Yup.boolean().required("This field cannot be blank")   
      default: 
        return Yup.mixed().required("This field cannot be blank")   
    }
  }

  const getSPListFieldValidation = (listName:string, fieldName:string, required?:boolean) => {
    const {lists} = state
    const field = lists[listName].fields.filter((v:any) => v.InternalName === fieldName)[0]    
    return field.Required || required ? getYupType(field.TypeAsString) : Yup.mixed()
  }

  const validationSchema = Yup.lazy((values:any) => {       
    return Yup.object().shape(Object.fromEntries(spAppSchema.map(list => {
      const fieldsValidation = Object.fromEntries(list.fields.map(field => [
        fieldIsUserField(list.name, field.name, state.lists) 
          ? `${field.name}Id` 
          : field.name,
        field.validation //if field validation function provided
          ? field.validation(values) 
          : getSPListFieldValidation(list.name, field.name, field.required)
      ]))
      return [list.name, list.parent //If Child List
        ? list.validation //if list validation function provided
          ? list.validation(values, Yup.array(Yup.object().shape(fieldsValidation)))
          : Yup.array(Yup.object().shape(fieldsValidation))           
        : Yup.object().shape(fieldsValidation)
      ]
    })))
  })

  const saveAttachments = async (files:SharePointAttachment[], item: Item) => {
    const deleteFiles = files.filter((i:SharePointAttachment) => {
        return (i.__metadata.deleted || i.__metadata.updated)
      })
      .map((i:SharePointAttachment) => {
        return i.FileName
      })
    const addFiles = files.filter((i:SharePointAttachment) => {
        return (i.__metadata.unsaved || i.__metadata.updated)
      })
      .map((i:SharePointAttachment) => {
        return {
          name: i.FileName,
          content: i.__metadata.fileObj
        }
      })    
    if (deleteFiles.length > 0)
      await item.attachmentFiles.deleteMultiple(...deleteFiles);
    if (addFiles.length > 0)
      await item.attachmentFiles.addMultiple(addFiles);
    const attachmentFiles = await item.attachmentFiles.get()        
    return attachmentFiles;
  }
  
  const {loaded, loadError} = state
  return <>    
    {loaded && !loadError ? <Formik
      initialValues={getDefaultValues()}      
      enableReinitialize
      onSubmit={_onSubmit}          
      validateOnMount={true}   
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={false}    
    >
      {(formikBag) => {

        const {values, setValues} = formikBag
        
        const saveApp = async (listName?: string | undefined | null, valuesOverride?: any) => {     
          let formikValues = valuesOverride ? {...valuesOverride} : {...values}     
          try {  
            const primaryListSchema = spAppSchema.filter(v => v.primary)[0]
            if (!primaryListSchema) throw ("SPAppSchema Error: No primary list found in spAppSchema array.")
            if (!formikValues[primaryListSchema.name]) throw ("SPAppSchema Error: Primary list name not found in initial formik values object.")
            if (!formikValues[primaryListSchema.name].ID) {           
              const savedPrimaryList = await pnpLists.getByTitle(primaryListSchema.name).items.add(resetNullValues(formikValues[primaryListSchema.name]))
              formikValues[primaryListSchema.name].ID = savedPrimaryList.data.ID
            }
            if (formikValues[primaryListSchema.name].ID) formikValues = Object.fromEntries(await Promise.all(Object.entries(formikValues)
              .filter((v:any) => v[0] == listName || !listName)
              .map(async ([listName, data]:[string, any]) => {  
                // const listName: string = v[0];
                // const data: any = v[1];
                if (Array.isArray(data)) 
                  return [listName, (await Promise.all(data.map(async item => {
                    let newItem = {...item}
                    //Delete item if its been marked as deleted
                    if (item.ID && item.__metadata && item.__metadata.deleted){
                      await pnpLists.getByTitle(listName).items.getById(item.ID).delete()
                      return item
                    }
                    //Get and set foreign key field to the ID of the primary list                
                    const fkFieldName = spAppSchema.filter(v => v.name == listName)[0].fields.filter(v => v.foreignKey)[0].name                    
                    newItem[fkFieldName] = formikValues[primaryListSchema.name].ID
                    
                    //Update if item exists
                    if (item.ID) await pnpLists.getByTitle(listName).items.getById(item.ID).update(resetNullValues(newItem))
                    //else Create if item does not exist
                    else newItem = {...item, ID: (await pnpLists.getByTitle(listName).items.add(resetNullValues(newItem))).data.ID}
                    
                    if (newItem.AttachmentFiles && newItem.AttachmentFiles.results && newItem.ID)
                      newItem.AttachmentFiles = {results: await saveAttachments(newItem.AttachmentFiles.results, pnpLists.getByTitle(listName).items.getById(newItem.ID))}  
                    
                    return newItem
                  }))).filter(item => item.__metadata && !item.__metadata.deleted || !item.__metadata)] //filter deleted items from returned array
                else if (typeof data === 'object'){
                  await pnpLists.getByTitle(listName).items.getById(data.ID).update(resetNullValues(data))
                  let newData = {...data}
                  if (data.AttachmentFiles && data.AttachmentFiles.results && data.ID)
                    newData.AttachmentFiles = {results: await saveAttachments(data.AttachmentFiles.results, pnpLists.getByTitle(listName).items.getById(data.ID))}                   
                  return [listName, newData]
                }
                else throw (`Formik Value ${listName} is neither Array or Object and cannot be saved.`)
              })
            ))
          }          
          catch (e) {
            console.error(e)
          }                    
          setValues(formikValues)
          return formikValues
        }

        const deleteApp = async (listName?:string) => {
          const {listData} = state
          await Promise.all(Object.entries(listData)
            .filter(([listDataKey]:[string, any]) => listName ? listName === listDataKey : true)
            .map(async ([listName, data]:[string, any]) => {
            if (Array.isArray(data))
              return await Promise.all(data.map(item => pnpLists.getByTitle(listName).items.getById(item.ID).delete()))
            else 
              return pnpLists.getByTitle(listName).items.getById(data.ID).delete()
          }))
          setState({...state, listData: Object.fromEntries(spAppSchema.map(v => v.parent ? [v.name, []] : [v.name, {}]))})
        }

        const addItem = (listName: string, item?: any) => {
          let newValues = {...values}
          if (!Array.isArray(newValues[listName])) throw "List is not an array."

          const listSchema = spAppSchema.filter(v => v.name === listName)[0]
          if (!listSchema) throw `List ${listName} Schema not found in spAppSchema.`

          newValues[listName] = [...newValues[listName], item ? item : getListDefaultValues(listSchema)]
          setValues(newValues)
        }

        const deleteItem = (item:any, listName:string) => {
          let newValues = {...values}
          if (!Array.isArray(newValues[listName])) throw "List is not an array."

          const index = newValues[listName].indexOf(item)
          if (!newValues[listName].includes(item)) throw "Item not found in list array."

          if (item.ID)
            newValues[listName][index] = {...newValues[listName][index], __metadata: { deleted: true}}
          else
             newValues[listName].splice(index,1)  
          setValues(newValues)        
        }

        return <>
          <SPAppContext.Provider value={{
            spAppSchema: spAppSchema,
            lists: state.lists,
            addItem: addItem,
            deleteItem: deleteItem,
            values: values
          }}>
            {isFunction(children) ? children({formikBag, saveApp, deleteApp}) : children}
          </SPAppContext.Provider>
        </>
      }}
    </Formik> 
    : loadError 
      ? <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={true}                    
        >
          Error Loading Form - {loadError.message}
        </MessageBar>
      : null 
    }
  </>

  //Private Functions
  async function _onSubmit(values: any, actions: FormikHelpers<any>){     
    actions.setSubmitting(true)   
    //const savedState = await saveForm(values, true)    
    
    actions.setSubmitting(false)   
    
  }
}

function removeNullValues(object:any){
  return Object.fromEntries(Object.entries(object).filter(v => v[1] !== null))
}

function resetNullValues(values: Object){
  return Object.fromEntries(Object.entries(values).map((item:any) => {    
    return (item[1] == "" || item[1] == 0) ? [item[0], null] : item    
  }))
}