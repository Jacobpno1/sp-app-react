import { ITextFieldProps, TextField, Label, Text, MaskedTextField, Checkbox, Toggle } from "@fluentui/react";
import { useField } from "formik";
import React, { useContext } from "react";
import { useSPField } from "../hooks/useSPField";
import { SPListContext } from "../SPList";

export const SPCheckDate = (props:any)  => {
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}
  if (props.name){
    //const [field, meta, helpers] = useField(props.name);
    const [field, meta, helpers, spProps] = useSPField(props);          
    const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;

    const _onChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => {
      helpers.setValue(checked ? (new Date()).toISOString() : "")
    }

    return (          
      <div>
        { !props.readOnly 
          ? 
            props.toggle ? <Toggle {...spProps} checked={field.value} onChange={_onChange} /> : <Checkbox {...spProps} checked={field.value} onChange={_onChange} />
          : <div>
              <Label>{props.name}</Label>
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
