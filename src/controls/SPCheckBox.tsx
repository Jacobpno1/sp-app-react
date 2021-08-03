import { ITextFieldProps, TextField, Label, Text, MaskedTextField, Checkbox, Toggle } from "@fluentui/react";
import { useField } from "formik";
import React, { useContext } from "react";
import { useSPField } from "../hooks/useSPField";
import { SPListContext } from "../SPList";

// const useSPField = (props: any) => {
//   const listContext = useContext(SPListContext);
//   const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}
//   const fieldProps = {...props, name: listProps.name ? listProps.name : props.name}
//   const [field, meta, helpers] = useField(listProps !== {} ? listProps.name : props.name); 
//   return [field, meta, helpers, {...listProps, ...fieldProps}]
// }

export const SPCheckBox = (props:any)  => {
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}
  // const fieldProps = {...props, name: listProps.name ? listProps.name : props.name}

  if (props.name){
    const [field, meta, helpers, spProps] = useSPField(props);        
    const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;

    const _onChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => {
      helpers.setValue(props.dateValue ? (checked ? (new Date()).toISOString() : "") : checked)
    }

    return (          
      <div style={{marginTop: 5}}>
        { !props.readOnly 
          ? 
            props.toggle ? <Toggle {...spProps} checked={field.value} onChange={_onChange} /> : <Checkbox {...spProps} styles={{root: {marginTop:29}}} checked={field.value} onChange={_onChange} />
          : <div>
              <Label>{spProps ? spProps.label : props.name}</Label>
              <Text>{field.value ? "Yes" : "No"}</Text>
            </div>
        }
      {(meta.touched && meta.error) ? (
        <span id="TextFieldDescription2">
          <div role="alert">
            <div className="ms-TextField-errorMessage errorMessage">
              <span data-automation-id="error-message">{error}</span>
            </div>
          </div>
        </span>
        ) : null
      }
      </div>
    );
  }
    else return (
      <h3>Provide a valid name for textfield.</h3>
    )
}
