import { ITextFieldProps, Text, Dropdown, IDropdownOption, IDropdownStyles, DropdownMenuItemType, Label } from "@fluentui/react";
import { useField, useFormikContext } from "formik";
import React, { useContext } from "react";
import { SPListContext } from "./SPList";

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 400 },
};

export function SPChoice(props:any){
  const [field, meta, helpers] = useField(props.name);
  const formikContext = useFormikContext();
  const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;
  const listContext = useContext(SPListContext);
  const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}

  const _onDismiss = () => {
    helpers.setTouched(true);
  }

  const isMultiSelect = () => {
    return props.multiSelect || (listProps && listProps.multiSelect)        
  }

  const _onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined): void => {    
    if (isMultiSelect() && option){
      const selectedValues = meta.value && meta.value.results ? meta.value.results : []
      helpers.setValue({
        __metadata: {
          type: "Collection(Edm.String)"
        },
        results: option.selected ? [...selectedValues, option.key] : selectedValues.filter((key: string) => key !== option.key)
      })
    }
    else{
      helpers.setValue(option ? option.text : null)      
    }      
    if (props.onChange)
      props.onChange(event, option, index)
  }

  const _onBlur = () => {
    helpers.setTouched(true)
  }

  // const selectedKeys = props.multiSelect
  //   ? (typeof(meta.value) == "string" ? [meta.value] : (meta.value && meta.value.results) ? meta.value.results : null)
  //   : [field.value]



  return (
    <>{ props.readOnly 
      ?<div>
        <Label>{listProps ? listProps.label : props.name}</Label>
        <Text>{isMultiSelect() ? field.value.results.join(", ") : field.value ? field.value.toString() : ""}</Text>
      </div>
      :<div>
        <Dropdown
          onDismiss={_onDismiss}          
          {...listProps}
          {...props}
          onChange={_onChange}
          onBlur={_onBlur}
          selectedKeys={(isMultiSelect() && field.value && field.value.results) ? field.value.results : undefined}
          placeholder="Select an option"
          //styles={dropdownStyles}
          errorMessage={error}
          selectedKey={field.value}
          onKeyUp={_onKeyDown}
          //selectedKey={}
          //tabIndex={}
        />
        {/* <pre>value: {meta.value}</pre> */}
      </div>
    }</>
  )

  function _onKeyDown(event: React.KeyboardEvent<HTMLDivElement>){
    
  }
}