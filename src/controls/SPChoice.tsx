import { ITextFieldProps, Text, Dropdown, IDropdownOption, IDropdownStyles, DropdownMenuItemType, Label, IDropdownProps } from "@fluentui/react";
import { useField, useFormikContext } from "formik";
import React, { useContext } from "react";
import { useSPField } from "../hooks/useSPField";
import { SPListContext } from "../SPList";

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 400 },
};

interface SPChoiceProps extends Partial<IDropdownProps> {
  name: string
  multiple?: boolean
  displayAsList? : boolean
  readOnly?: boolean
  options?: any
}


export function SPChoice(props:SPChoiceProps){
  // const [field, meta, helpers] = useField(props.name);
  const [field, meta, helpers, spProps] = useSPField(props);          
  // const formikContext = useFormikContext();
  const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && props.name) ? listContext.getFieldProps(props.name) : {}

  const _onDismiss = () => {
    helpers.setTouched(true);
  }

  const isMultiSelect = () => {
    return props.multiple || (spProps && spProps.multiSelect)        
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

  const renderReadOnlyMultiSelect = () => {
    return props.displayAsList 
    ? <ul style={{margin: 0, padding: 0, listStyle: "none"}}>
      {field.value.results.map((v: string, i: number) => <li style={{marginBottom: 5}} key={i}>{v}</li>)}
    </ul>          
    : field.value.results.join(", ")
  }

  return (
    <>{ props.readOnly 
      ?<div>
        <Label>{spProps ? spProps.label : props.name}</Label>
        <Text>{isMultiSelect() 
          ? renderReadOnlyMultiSelect()
          : field.value ? field.value.toString() : ""}
        </Text>
      </div>
      :<div>
        <Dropdown
          onDismiss={_onDismiss}          
          {...spProps}
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