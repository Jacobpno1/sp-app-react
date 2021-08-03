import { useField } from "formik";
import { useContext } from "react";
import { SPListContext } from "../SPList";

export const useSPField = (props: any) => {
  const listContext = useContext(SPListContext);
  const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name, props.index) : {}
  
  const fieldProps = {...props, name: listProps.name ? listProps.name : props.name}
  const [field, meta, helpers] = useField(listProps !== {} ? listProps.name : props.name);   
  return [field, meta, helpers, {...listProps, ...fieldProps}, listContext]
}