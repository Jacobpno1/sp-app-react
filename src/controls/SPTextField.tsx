import { ITextFieldProps, TextField, Label, Text, MaskedTextField, IMaskedTextFieldProps } from "@fluentui/react";
import { useField } from "formik";
import React, { useContext } from "react";
import { useSPField } from "../hooks/useSPField";
import { SPListContext } from "../SPList";

interface SPTextFieldProps extends ITextFieldProps {
  index?: number
}

interface SPMaskedTextFieldProps extends IMaskedTextFieldProps {
  index?: number
}

export const SPTextField = (props: SPTextFieldProps | SPMaskedTextFieldProps)  => {
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name, props.index) : {}

  // const fieldProps = {...props, name: listProps.name ? listProps.name : props.name}

  if (props.name){
    const [field, meta, helpers, spProps] = useSPField(props);  
    //const [field, meta, helpers] = useField(listProps !== {} ? listProps.name : props.name);
    const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;
    return (          
      <div>
        { !props.readOnly 
          ? 
            (props as IMaskedTextFieldProps).mask ?
              <MaskedTextField {...field} {...spProps} errorMessage={error}/> 
            : <TextField {...field} {...spProps} errorMessage={error}/> 
          : <div>
              <Label>{spProps && spProps.label ? spProps.label : props.label}</Label>
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