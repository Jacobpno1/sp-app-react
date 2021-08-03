import {  Label, Text, SpinButton, ISpinButtonProps, TextField } from "@fluentui/react";
import { useField } from "formik";
import React, { useContext, useState, useEffect } from "react";
import { useSPField } from "../hooks/useSPField";
import { SPListContext } from "../SPList";

interface SPCurrencyProps extends ISpinButtonProps {
  name: string
  readOnly?: boolean
  required?: boolean | undefined
}

export const SPCurrency = (props:SPCurrencyProps)  => {
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}    

  if (props.name){
    // const [field, meta, helpers] = useField(props.name);        
    const [field, meta, helpers, spProps] = useSPField(props); 
    const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;    
    const [stringValue, setStringValue] = useState("")
        
    useEffect(() => {      
      setStringValue(field.value ? "$" + field.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")
    }, [field.value])

    const onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
      setStringValue(newValue ? newValue : "")
    };

    const onBlur = (event: React.SyntheticEvent<HTMLElement>) => {
      if (stringValue) { 
        let commaFreeStringValue = stringValue.replace(/[^\d\.]/g, "")
        const match =  /\D*(\d*)(\.\d*)/.test(commaFreeStringValue) ? commaFreeStringValue.match(/\D*(\d*)(\.\d*)/) : commaFreeStringValue.match(/\D*(\d*)/)        
        if (match){          
          const numberValue = Number(match[2] ? match[1] + match[2] : match[1])
          setStringValue("$" + numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
          helpers.setValue(numberValue ? numberValue : 0)
        }
      }
    };

    const setValue = () => {
      return field.value ? "$" + field.value.toFixed(2) : "$0.00"      
    }


    return (          
      <div>
        { !props.readOnly 
          ? 
            <TextField {...spProps} errorMessage={error} onBlur={onBlur} onChange={onChange} value={stringValue} /> 
          : <div>
              <Label>{spProps && spProps.label ? spProps.label : props.label}</Label>
              <Text>{stringValue}</Text>
            </div>
        }
      </div>
    );
  }
    else return (
      <h3>Provide a valid name for textfield.</h3>
    )
}
