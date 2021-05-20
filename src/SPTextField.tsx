import { ITextFieldProps, TextField, Label, Text, MaskedTextField, IMaskedTextFieldProps } from "@fluentui/react";
import { useField } from "formik";
import React, { useContext } from "react";
import { SPListContext } from "./SPList";

export const SPTextField = (props:ITextFieldProps | IMaskedTextFieldProps)  => {
  const listContext = useContext(SPListContext);
  const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}
  if (props.name){
    const [field, meta, helpers] = useField(props.name);        
    const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;
    return (          
      <div>
        { !props.readOnly 
          ? 
            (props as IMaskedTextFieldProps).mask ?
              <MaskedTextField {...field} {...listProps} {...props} errorMessage={error}/> 
            : <TextField {...field} {...listProps} {...props} errorMessage={error}/> 
          : <div>
              <Label>{listProps && listProps.label ? listProps.label : props.label}</Label>
              <Text>{field.value}</Text>
            </div>
        }
      </div>
    );
  }
    else return (
      <h3>Provide a valid name for textfield.</h3>
    )
}